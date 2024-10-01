require('dotenv').config();
require('../backend/utils/cronJobs');
const http = require('http');
const { Server } = require('socket.io');
const prisma = require('./prisma/prismaClient');
const app = require('./app'); // Import the Express app
const { Pool } = require('pg');
const { getAreaIdsByCityId } = require('./models/parkingModel');
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const availableSpotsMap = new Map();
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function countAvailableSpots(cityID) {
  try {
    console.log(`Counting available spots for city ID: ${cityID}`); // Debug log
    const areaIds = await getAreaIdsByCityId(cityID);
    console.log(`Fetched area IDs for city ${cityID}:`, areaIds); // Debug log for fetched area IDs

    const availableSpots = await prisma.slots.count({
      where: {
        AreaID: { in: areaIds },
        Busy: false,
        Reservations: {
          none: {
            ReservationStart: { lte: new Date() }, // Only count slots with no ongoing reservations
            ReservationEnd: { gte: new Date() }
          }
        }
      }
    });

    console.log(`Available spots for city ${cityID}: ${availableSpots}`); // Debug available spots
    availableSpotsMap.set(cityID, availableSpots);
    io.to(cityID).emit('count_available_spots', cityID, availableSpots); // Emit available spots to all clients in the room
  } catch (error) {
    console.error(`Error counting available spots for city ${cityID}:`, error.message);
  }
}

async function updateAvailableSpots(cityID) {
  try {
    // Recalculate the available spots from the database for the given cityID
    console.log(`Recalculating available spots for city ${cityID}`); // Debug log

    // Fetch the area IDs for the city
    const areaIds = await getAreaIdsByCityId(cityID);

    // Count the number of available slots (Busy = false, no ongoing reservations)
    const availableSpots = await prisma.slots.count({
      where: {
        AreaID: { in: areaIds },
        Busy: false,
        Reservations: {
          none: {
            ReservationStart: { lte: new Date() }, // No reservations starting before now
            ReservationEnd: { gte: new Date() } // No reservations ending after now
          }
        }
      }
    });

    console.log(`Recalculated available spots for city ${cityID}: ${availableSpots}`); // Debug log

    // Update the available spots map
    availableSpotsMap.set(cityID, availableSpots);

    // Emit the updated count to all clients subscribed to this city
    io.to(cityID).emit('updateAvailableSpots', cityID, availableSpots);
  } catch (error) {
    console.error(`Error recalculating available spots for city ${cityID}:`, error.message);
  }
}

const server = http.createServer(app); // Create an HTTP server with Express app
const io = new Server(server, {
  cors: {
    origin: [frontendURL], // Use the FRONTEND_URL from the .env file
    methods: ['GET', 'POST'],
    credentials: true
  }
});

pgPool.connect().then((client) => {
  client.query('LISTEN slot_change');
  console.log('Listening for PostgreSQL notifications on channel "slot_change"'); // Debug when listener starts

  client.on('notification', async (msg) => {
    const payload = JSON.parse(msg.payload);
    console.log(`Received notification for slot change:`, payload); // Debug incoming payload

    const areaID = payload.area_id;
    const isBusy = payload.is_busy;

    try {
      const cityIdResult = await prisma.areas.findUnique({
        where: { idAreas: areaID },
        select: { CityID: true }
      });

      if (cityIdResult) {
        const cityID = cityIdResult.CityID;
        console.log(`Area ${areaID} belongs to city ${cityID}`); // Debug for cityID
        await updateAvailableSpots(cityID, isBusy);
      } else {
        console.error(`Area ID ${areaID} not found`); // Debug if area ID is not found
      }
    } catch (error) {
      console.error('Error resolving city ID:', error.message); // Error resolving city
    }
  });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id); // Log when a user connects

  socket.on('subscribe_to_city', async (cityID) => {
    socket.join(cityID);
    console.log(`User ${socket.id} subscribed to city ${cityID}`); // Log subscription
    await countAvailableSpots(cityID); // Emit initial available spots
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id); // Log disconnections
  });
});

// Start the server
server.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});
