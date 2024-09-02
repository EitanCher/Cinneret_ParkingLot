// socket.js
require('dotenv').config();
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

async function countAvailableSpots(cityID) {
  try {
    console.log('try block countavailablespots');
    const areaIds = await getAreaIdsByCityId(cityID); // Await the result of getAreaIdsByCityId

    const availableSpots = await prisma.slots.count({
      where: {
        AreaID: {
          in: areaIds // Filter by the list of area IDs
        },
        Busy: false,
        Reservations: {
          none: {
            ReservationStart: {
              lte: new Date() // Reservation start time should be less than or equal to now
            },
            ReservationEnd: {
              gte: new Date() // Reservation end time should be greater than or equal to now
            }
          }
        }
      }
    });
    availableSpotsMap.set(cityID, availableSpots);

    io.to(cityID).emit('count_available_spots', cityID, availableSpots);
    console.log(`Initial count of available spots for city ${cityID}: ${availableSpots}`);
  } catch (error) {
    console.error(`Error counting available spots for city ${cityID}:`, error.message);
  }
}

// Function to update available spots based on notifications
async function updateAvailableSpots(cityID, isBusy) {
  try {
    let availableSpots = availableSpotsMap.get(cityID) || 0;
    const areaIds = await getAreaIdsByCityId(cityID); // Await the result of getAreaIdsByCityId
    if (isBusy) availableSpots -= 1;
    if (!isBusy) availableSpots += 1;
    availableSpotsMap.set(cityID, availableSpots); // Update the map with the new count
    io.to(cityID).emit('updateAvailableSpots', cityID, availableSpots);
    console.log(`Updated available spots for city ${cityID}: ${availableSpots}`);
  } catch (error) {
    console.error('Error updating available spots:', error.message);
  }
}

const server = http.createServer(app); // Create an HTTP server with Express app
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Allow both origins
    methods: ['GET', 'POST']
  }
});

pgPool.connect().then((client) => {
  client.query('LISTEN slot_change');
  client.on('notification', async (msg) => {
    const payload = JSON.parse(msg.payload);
    const areaID = payload.area_id;
    const isBusy = payload.is_busy;
    console.log(`Received notification for area ${areaID}: ${payload}`);
    try {
      const cityIdResult = await prisma.areas.findUnique({
        where: { idAreas: areaID },
        select: { CityID: true }
      });
      if (cityIdResult) {
        const cityID = cityIdResult.CityID;
        await updateAvailableSpots(cityID, isBusy); // Await the result of updateAvailableSpots
      } else {
        console.error(`Area ID ${areaID} not found`);
      }
    } catch (error) {
      console.error('Error resolving city ID:', error.message);
    }
  });
  console.log('Listening for PostgreSQL notifications on channel "slot_change"');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('subscribe_to_city', async (cityID) => {
    socket.join(cityID);
    console.log(`User subscribed to city ${cityID}`);
    await countAvailableSpots(cityID);
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
server.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});
