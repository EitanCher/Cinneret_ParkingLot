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
    console.log(`Counting available spots for city ID: ${cityID}`);

    const areaIds = await getAreaIdsByCityId(cityID);
    console.log(`Fetched area IDs for city ${cityID}:`, areaIds);

    const availableSpots = await prisma.slots.count({
      where: {
        AreaID: { in: areaIds },
        Busy: false
      }
    });

    console.log(`Available spots for city ${cityID}: ${availableSpots}`); // Debug available spots
    availableSpotsMap.set(cityID, availableSpots); // Update the in-memory map

    // Emit the available spots count to clients subscribed to this city's room
    io.to(cityID).emit('updateAvailableSpots', cityID, availableSpots);
  } catch (error) {
    console.error(`Error counting available spots for city ${cityID}:`, error.message);
  }
}

async function updateAvailableSpots(cityID) {
  try {
    console.log(`Recalculating available spots for city ${cityID}`); // Debug log

    const areaIds = await getAreaIdsByCityId(cityID);

    // Count available spots based on `Busy: false` only
    const availableSpots = await prisma.slots.count({
      where: {
        AreaID: { in: areaIds }, // Areas must be in the specified city
        Busy: false // Slot must not be busy
      }
    });

    console.log(`Recalculated available spots for city ${cityID}: ${availableSpots}`); // Debug log
    availableSpotsMap.set(cityID, availableSpots); // Update the in-memory map

    // Emit the updated count to all clients subscribed to this city's room
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
        console.log(`Area ${areaID} belongs to city ${cityID}`);
        await updateAvailableSpots(cityID, isBusy);
      } else {
        console.error(`Area ID ${areaID} not found`);
      }
    } catch (error) {
      console.error('Error resolving city ID:', error.message);
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
