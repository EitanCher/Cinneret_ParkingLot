require('dotenv').config();
require('../backend/utils/cronJobs');
const http = require('http');
const prisma = require('./prisma/prismaClient');
const app = require('./app');
const { Pool } = require('pg');
const { getAreaIdsByCityId } = require('./models/parkingModel');
const { init } = require('./io'); // Use io.js to initialize Socket.IO
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const availableSpotsMap = new Map();
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';

// HTTP server creation
const server = http.createServer(app);

// Initialize io using io.js
const io = init(server);

// PostgreSQL listener setup
pgPool.connect().then((client) => {
  client.query('LISTEN slot_change');
  console.log('Listening for PostgreSQL notifications on channel "slot_change"');

  client.on('notification', async (msg) => {
    const payload = JSON.parse(msg.payload);
    console.log(`Received notification for slot change:`, payload);

    const areaID = payload.area_id;
    const isBusy = payload.is_busy;

    try {
      const cityIdResult = await prisma.areas.findUnique({
        where: { idAreas: areaID },
        select: { CityID: true }
      });

      if (cityIdResult) {
        const cityID = cityIdResult.CityID;
        await updateAvailableSpots(cityID, isBusy);
      } else {
        console.error(`Area ID ${areaID} not found`);
      }
    } catch (error) {
      console.error('Error resolving city ID:', error.message);
    }
  });
});

// Count available spots function
async function countAvailableSpots(cityID) {
  try {
    console.log(`Counting available spots for city ID: ${cityID}`);
    const areaIds = await getAreaIdsByCityId(cityID);
    const availableSpots = await prisma.slots.count({
      where: {
        AreaID: { in: areaIds },
        Busy: false
      }
    });
    availableSpotsMap.set(cityID, availableSpots);
    io.to(cityID).emit('updateAvailableSpots', cityID, availableSpots);
  } catch (error) {
    console.error(`Error counting available spots for city ${cityID}:`, error.message);
  }
}

// Update available spots function
async function updateAvailableSpots(cityID) {
  try {
    console.log(`Recalculating available spots for city ${cityID}`);
    const areaIds = await getAreaIdsByCityId(cityID);
    const availableSpots = await prisma.slots.count({
      where: {
        AreaID: { in: areaIds },
        Busy: false
      }
    });
    availableSpotsMap.set(cityID, availableSpots);
    io.to(cityID).emit('updateAvailableSpots', cityID, availableSpots);
  } catch (error) {
    console.error(`Error recalculating available spots for city ${cityID}:`, error.message);
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  const userId = socket.handshake.auth.userId;
  console.log('userid in socket is', userId);
  console.log('user id is ', userId);

  if (userId) {
    socket.join(`user-${userId}`); // Join the user-specific room using userId
    console.log(`User ${socket.id} joined room user-${userId}`);
  }

  // Subscribe to city updates
  socket.on('subscribe_to_city', async (cityID) => {
    socket.join(cityID); // Join the room for city-specific updates
    console.log(`User ${socket.id} subscribed to city ${cityID}`);
    await countAvailableSpots(cityID);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
server.listen(process.env.PORT || 3001, () => {
  console.log(`Server is running on port ${process.env.PORT || 3001}`);
});

module.exports = io; // Export the 'io' instance instead of 'socket'
