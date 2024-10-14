const path = require('path');
const express = require('express');
const webSocket = require('ws');
const app = express();
const os = require('os');
const myDBPool = require('./db_config');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const exp = require('constants');
const { createWorker } = Tesseract;

const WS_PORT = 7777;
const myLocalIP = getLocalIPAddress();
const wsServer = new webSocket.Server({ port: WS_PORT }, () => console.log(`Websocket server is listening at ${WS_PORT}`));
let allBoards = { gates: [], gateCams: [], slots: [], slotCams: [] }; // Empty arrays - to enable push command in fetchBoardsDataOnInit()

// Detect disturbances on cameras and sensors:
let disturbancesOnCameras = {};
let disturbancesOnSensors = {};
setInterval(() => {
  for (board in disturbancesOnCameras) {
    if (disturbancesOnCameras[board] > 10) {
      console.log(`\nContinuous disturbancy found on Camera ${board}\n`);
      disturbancesOnCameras[board] = 0;
    }
  }
  for (board in disturbancesOnSensors) {
    if (disturbancesOnSensors[board] > 10) {
      console.log(`\nContinuous disturbancy found on Sensor ${board}\n`);
      disturbancesOnSensors[board] = 0;
    }
  }
}, 1000);
/*
let lotClients = {
    gates:      [{ip: '192.168.1.3', wsc: null, isFault: false, isConnected: false}],
    gateCams:   [{ip: '192.168.1.6', wsc: null, isFault: false, isConnected: false}],
    slots:      [{ip: '192.168.1.2', wsc: null, isFault: false, isConnected: false}],
    slotCams:   [{ip: '192.168.1.8', wsc: null, isFault: false, isConnected: false}]
}
*/

// Get local IP address:
console.log('Local IP Address: ', myLocalIP);

// Get the list of boards registered at the DB:
fetchBoardsDataOnInit();

// WebSocket server logic:
wsServer.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress.replace('::ffff:', ''); // Get client IP address
  console.log('New client connected:', ip);
  // Store the client in allBoards and return data of itself and its node-"partner"
  connectionStatus(ip, ws, true);
  const nodeType = findKindOfBoard(ip);
  ws.isAlive = true;
  let isPingable = true;
  let slotID;
  let isReservedGlobal = false; // Support updating the Slot only when status changed
  if (nodeType == 'slots') {
    for (const boardsArray in allBoards) {
      const myArray = allBoards[boardsArray];
      for (const boardDict of myArray) if (boardDict.ip === ip) slotID = boardDict.id;
    }
  }

  // Send a ping to the client every 300 seconds:
  setInterval(() => {
    if (isPingable) {
      if (ws.isAlive === false) {
        console.log(`Client ${ip} did not respond to ping, terminating connection`);
        isPingable = false;
        connectionStatus(ip, ws, false); // Mark as disconnected in allBoards
        return ws.terminate();
      }
    }

    ws.isAlive = false;
    console.log(`Sending ping to: ${ip}`);
    ws.ping();
  }, 300000);

  // For Slots: check if reserved:
  setInterval(async () => {
    if (nodeType == 'slots') {
      const pgClient = await myDBPool.connect();
      try {
        const querySlot = `SELECT EXISTS (SELECT 1 FROM \"Reservations\" \
                    WHERE \"SlotID\" = $1 AND \"Status\" LIKE $2);`;
        const result = await pgClient.query(querySlot, [slotID, 'pending']);
        const isReserved = result.rows[0].exists;

        if (isReserved && !isReservedGlobal) {
          ws.send('RESERVATION_ON');
          isReservedGlobal = true;
        } else if (!isReserved && isReservedGlobal) {
          ws.send('RESERVATION_OFF');
          isReservedGlobal = false;
        } else isReserved = false;
        isReservedGlobal = false;
      } catch (err) {
      } finally {
        pgClient.release();
      }
    }
  }, 30000);

  ws.on('pong', () => {
    ws.isAlive = true;
    isPingable = true; // For cases of getting pong with too long delay
    console.log(`Pong received from: ${ip}`);
  });

  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      console.log('Received binary data from client');
      const imagePath = `./images/image_${ip}.png`;
      fs.writeFile(imagePath, data, (err) => {
        if (err) throw err;
        console.log(`Image saved as ${imagePath}`);
      });

      // Retrieve text data from the taken image:
      (async () => {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(imagePath);
        const imageText = ret.data.text;
        console.log('=========== TEXT FROM IMAGE: ');
        console.log(imageText);
        await worker.terminate();
        const registrationID = await processImage(imageText, ip);
        if (registrationID != '') {
          if (nodeType == 'gateCams') await openGate(registrationID, ip);
          else if (nodeType == 'slotCams') {
            await respondOnSlotEntry(registrationID, ip);
          }
        }
      })();
    }
    // If not a binary data but a simple text message:
    else {
      const message = data.toString();
      console.log('Received:', message);

      const nodePair = getNodePair(ip);
      const boardData_1 = nodePair[0]; // Get dictionary of connected board's data
      const boardData_2 = nodePair[1]; // Get dictionary of corresponding board's data

      if (!boardData_1.isFault) {
        if (!boardData_1.isConnected) boardData_1.isConnected = true;

        switch (message) {
          case 'PARKING_ATTEMPT_SUCCESS':
          case 'OBJECT_DETECTED':
            if (boardData_2.wsc != null) {
              boardData_2.wsc.send('TAKE_PICTURE');
              console.log(`Trigger sent to camera ${boardData_2.ip}`);
            } else {
              console.log(`Camera ${boardData_2.ip} not connected.`);
              // Unblock proximity sensor:
              boardData_1.wsc.send('PREPARE_ANOTHER_SHOT');
            }
            break;
          case '0_DISTANCE':
            disturbancesOnSensors[ip]++;
            break;
          case 'PARKING_ATTEMPT_DETECTED':
            // TBD:
            // - Read the Car ID;
            // - Connect to the DB;
            // - Inform the user on the allowed parking duration
            boardData_1.wsc.send('PARKING_ATTEMPT_ACKNOWLEDGED');
            break;
          case 'PARKING_FINISHED':
            // Update the DB:
            console.log('EXIT THE SLOT, UPDATING THE DB');
            updateExitSlot(slotID);
            break;
        }
      }
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log(`Client disconnected: ${ip}`);
    connectionStatus(ip, ws, false);
  });
});

//===============================================================
//         FUNCTIONS:
//===============================================================

async function updateExitSlot(slotID) {
  const pgClient = await myDBPool.connect();
  console.log('Parking finished - UPDATING THE DB...');
  try {
    await queryUpdateSlotBusy(pgClient, slotID, false);
  } catch (err) {
    console.error(err);
  } finally {
    await pgClient.release();
  }
}

// Parking started:
async function respondOnSlotEntry(regID, inputIP) {
  const pgClient = await myDBPool.connect();
  try {
    // Verify the Pattern is registered in the DB as a valid ID:
    const result = await queryFindCarID(pgClient, regID);

    if (result.rows.length > 0) {
      const carID = result.rows[0].idCars;
      console.log(`Found match for ${regID}: Car ID ${carID}`);

      // Find the Slot corresponding to the current camera:
      const targetSlot = getNodePair(inputIP)[1];
      const slotID = targetSlot.id;

      // Update Slot status to Busy:
      try {
        await queryUpdateSlotBusy(pgClient, slotID, true);
      } catch (err) {
        console.error('Error updating Slot to Busy: ', err);
      }

      // Check if the Slot is free or reserved:
      try {
        console.log('Checking if the Slot is reserved...');
        const isReserved = await queryCheckReservation(pgClient, slotID, 'pending');

        if (isReserved) {
          // Check if the Slot is reserved for the current Car ID
          try {
            console.log('Checking if reserved for the current Car ID...');
            const isConfirmed = await queryCheckValidReservation(pgClient, slotID, carID);

            if (isConfirmed) {
              console.log(`The Slot ${inputIP} is reserved for current Car ID - SENDING APPROVAL`);
              targetSlot.wsc.send('PARKING_SUCCESS_ACKNOWLEDGED');
              // Update the Reservation status:
              console.log('Updating Reservation Status to active...');
              try {
                await queryUpdateReservationStatus(pgClient, carID, 'active');
              } catch (err) {
                console.error('Error updating Reservation status: ', err);
              }
            } else {
              console.log(`Violation detected: Slot ${inputIP} is reserved for another Car ID`);
              // Update Violation in the DB log:
              try {
                await queryUpdateViolation(pgClient, carID, true);
              } catch (err) {
                console.error('Error adding violation in the Log: ', err);
              }
              // Increment violations count for current User:
              try {
                await queryUpdateViolationUser(pgClient, carID);
              } catch (err) {
                console.error('Error incrementing violations count in Users: ', err);
              }

              targetSlot.wsc.send('VIOLATION_ON');
            }
          } catch (err) {
            console.error('Error checking reservation match: ', err);
          }
        } else {
          console.log(`The Slot ${inputIP} is not reserved - SENDING APPROVAL`);
          targetSlot.wsc.send('PARKING_SUCCESS_ACKNOWLEDGED');
        }
      } catch (err) {
        console.error('Error checking if reservation exists: ', err);
      }
    } else {
      disturbancesOnCameras[inputIP]++;
      // Find the Slot corresponding to the current camera and unblock its proximity sensor:
      const targetSlot = getNodePair(inputIP)[1];
      targetSlot.wsc.send('PREPARE_ANOTHER_SHOT');
      console.log(`\nNo matches found for ${regID} parking at Slot ${inputIP}, ready to take another shot\n`);
    }
  } catch (err) {
    console.error('Error executing query: ', err);
  } finally {
    await pgClient.release();
  }
}

// Update status of the node in the network:
function connectionStatus(inputIP, inputConn, isConn) {
  for (const boardsArray in allBoards) {
    const myArray = allBoards[boardsArray];
    for (const boardDict of myArray) {
      // Find the metadata of the connected board by its IP:
      if (boardDict.ip === inputIP) {
        boardDict.isConnected = isConn;
        if (isConn) {
          if (boardDict.isConnected) console.log(boardDict.ip);
          // Store the connection object:
          boardDict.wsc = inputConn;
          // Create key-value in the "disturbances" list (for cameras only):
          if (boardsArray == 'gateCams' || boardsArray == 'slotCams') disturbancesOnCameras[inputIP] = 0;
          else disturbancesOnSensors[inputIP] = 0;
        } else {
          if (disturbancesOnCameras.hasOwnProperty(inputIP)) delete disturbancesOnCameras.inputIP;
          if (disturbancesOnSensors.hasOwnProperty(inputIP)) delete disturbancesOnSensors.inputIP;
        }
      }
    }
  }
}

// Retrieve Parking-Lot nodes expected by the DB:
async function fetchBoardsDataOnInit() {
  console.log('Fetching data from the DB..................');
  const pgClient = await myDBPool.connect();
  try {
    const res1 = await pgClient.query('SELECT "Fault", "CameraIP", "GateIP", "Entrance" FROM "Gates";');
    const res2 = await pgClient.query('SELECT "Fault", "CameraIP", "SlotIP", "idSlots" FROM "Slots";');

    // Purge the existing metadata:
    for (boardsArray in allBoards) boardsArray = [];

    // Store gates' and gateCams' metadata:
    res1.rows.forEach((row) => {
      let myGateDict = {};
      let myGateCamDict = {};
      myGateDict.ip = row.GateIP;
      myGateCamDict.ip = row.CameraIP;
      myGateDict.isFault = row.Fault;
      myGateCamDict.isFault = row.Fault;
      myGateDict.isConnected = false;
      myGateCamDict.isConnected = false;
      myGateDict.isEntry = row.Entrance;

      allBoards.gates.push(myGateDict); // Add the Gate dictionary into 'gates' array
      allBoards.gateCams.push(myGateCamDict); // Add the Gate Cam dictionary into 'gateCams' array
    });

    // Store slots' and slotCams' metadata:
    res2.rows.forEach((row) => {
      let mySlotDict = {};
      let mySlotCamDict = {};
      mySlotDict.id = row.idSlots;
      mySlotDict.ip = row.SlotIP;
      mySlotCamDict.ip = row.CameraIP;
      mySlotDict.isFault = row.Fault;
      mySlotCamDict.isFault = row.Fault;
      mySlotDict.isConnected = false;
      mySlotCamDict.isConnected = false;

      allBoards.slots.push(mySlotDict); // Add the Slot dictionary into 'slots' array
      allBoards.slotCams.push(mySlotCamDict); // Add the Slot Cam dictionary into 'slotCams' array
    });

    console.log('Boards data after "Fetch":');
    console.log(allBoards);
    console.log('*******   Fetch done   *********************');
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await pgClient.release();
  }
}

function findKindOfBoard(inputIP) {
  for (let arrayName in allBoards) {
    if (allBoards[arrayName].some((item) => item.ip === inputIP)) {
      // Return the name of the boards array ("gates" / "gateCams" / "slots" / "slotCams"):
      return arrayName;
    }
  }
  return null;
}

function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const i in addresses) {
      const address = addresses[i];
      // Check if it's an IPv4 address and not an internal (loopback) address
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback to loopback address
}

function getNodePair(inputIP) {
  // Map the nodes pairs:
  const pairsMap = {
    gates: 'gateCams',
    gateCams: 'gates',
    slots: 'slotCams',
    slotCams: 'slots'
  };

  // Find corresponding board (Camera for Node / Node for Camera):
  for (const boardsArray in allBoards) {
    const myArray = allBoards[boardsArray];
    for (const boardDict of myArray) {
      if (boardDict.ip === inputIP) {
        const myIndex = myArray.indexOf(boardDict);
        const correspondingArray = pairsMap[boardsArray];
        const correspondingBoard = allBoards[correspondingArray][myIndex];
        return [boardDict, correspondingBoard];
      }
    }
  }
  console.log(`No peer found for client ${inputIP}`);
  return null;
}

// Verify the Registration ID is valid and respond by opening / not opening the Gate:
async function openGate(regID, inputIP) {
  let carID = 0;
  let isAvailable = true;
  let isValid = true;
  const pgClient = await myDBPool.connect();
  // Find the gate corresponding to the current camera:
  const targetGate = getNodePair(inputIP)[1];

  // Verify the Pattern is registered in the DB as a valid ID:
  try {
    const result = await queryFindCarID(pgClient, regID);
    if (result.rows.length > 0) {
      carID = result.rows[0].idCars;
      console.log(`Found match for ${regID}: Car ID ${carID}`);

      // Check if available slots found:
      try {
        isAvailable = await queryCheckAvailable(pgClient);
        if (isAvailable) {
          // Find the Gate corresponding to the current camera and open it:
          targetGate.wsc.send('OPEN_GATE');

          // Update the Parking log:
          if (targetGate.isEntry) logEntry(pgClient, carID);
          else logExit(pgClient, carID);

          console.log(`Available slots found. Trigger sent to open Gate ${inputIP}`);
        } else console.log('No parking slots available at the moment. Entry refused!');
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log(`\nNo matches found for ${regID}, ready to take another shot\n`);
      disturbancesOnCameras[inputIP]++;
      // Unblock proximity sensor:
      targetGate.wsc.send('PREPARE_ANOTHER_SHOT');
      isValid = false;
    }
  } catch (err) {
    console.error('Error executing query: ', err);
  } finally {
    pgClient.release();
  }
}

// Retrieve text from Image:
async function processImage(imageText, inputIP) {
  const myPattern1 = imageText.match(/\d{2}\W\d{3}\W\d{2}/); // ID pattern: "12-345-67"
  const myPattern2 = imageText.match(/\d{3}\W\d{2}\W\d{3}/); // ID pattern: "123-45-678"
  let myPattern = '';

  // Check if any Pattern occurs in the Image Text:
  if (myPattern1 == null && myPattern2 == null) {
    disturbancesOnCameras[inputIP]++;

    // Find the gate corresponding to the current camera and unblock its proximity sensor:
    const targetGate = getNodePair(inputIP)[1];
    targetGate.wsc.send('PREPARE_ANOTHER_SHOT');
    console.log('\nPattern not found, ready to take another shot\n');

    return '';
  }

  if (myPattern1 != null) myPattern = myPattern1;
  if (myPattern2 != null) myPattern = myPattern2;

  const regID = String(myPattern).replace(/\W/g, ''); // Remove the non-alphabetical characters
  console.log(`Pattern found: ${regID}`);
  disturbancesOnCameras[inputIP] = 0;
  return regID;
}

async function logExit(pgClient, carID) {
  // Remove relevant row from Reservations table in the DB (if present):
  console.log(`Updating Reservation log for car ${carID} to \'finished\'...`);
  try {
    await queryUpdateReservationStatus(pgClient, carID, 'finished');
  } catch (err) {
    console.error('Error updating Reservation to finished: ', err);
  }

  // Update Log table:
  console.log(`Updating Exit-time for car ${carID}...`);
  try {
    await queryUpdateLatestCarLog(pgClient, carID);
  } catch (err) {
    console.error('Error updating Exit Time in Log: ', err);
  }
}

// Add a row into Parking-Log table in the DB:
async function logEntry(pgClient, carID) {
  // Check if Reservation exists for current car:
  let reservationID = null;
  let endBy = 6;
  try {
    const query = `SELECT \"idReservation\", \"ReservationEnd\" FROM \"Reservations\" WHERE \
            \"CarID\" = $1 AND \"Status\" LIKE $2;`;

    const result = await pgClient.query(query, [carID, 'pending']);
    if (result.rows.length > 0) {
      reservationID = result.rows[0].idReservation;
      endBy = result.rows[0].ReservationEnd;
      console.log(`Reservation found for this car (id ${reservationID})`);
    } else console.log('No reservations found for this car');
  } catch (err) {
    console.error('Error executing Reservations-check query: ', err);
  }

  // Insert a row into Parking Log table having all the required values set:
  try {
    await queryInsertLogRow(pgClient, carID, reservationID, endBy);
  } catch (err) {
    console.error('Error executing ParkingLog-update query: ', err);
  }
}

//===============================================================
//         QUERIES:
//===============================================================

async function queryFindCarID(pgClient, myCar) {
  const query = `SELECT \"idCars\" FROM \"Cars\" WHERE \"RegistrationID\" LIKE $1;`;
  const values = [`%${myCar}%`];
  const result = await pgClient.query(query, values);
  return result;
}
async function queryCheckAvailable(pgClient) {
  const query = `SELECT \"idSlots\" FROM \"Slots\" \
        WHERE \"Busy\" = $1 AND \"idSlots\" \
            NOT IN (SELECT \"SlotID\" FROM \"Reservations\" \
                WHERE \"Status\" = $2 AND \"ReservationStart\" < $3);`;

  const result = await pgClient.query(query, [false, 'pending', 'NOW()']);
  if (result.rows.length > 0) return true;
  return false;
}
async function queryCheckReservation(pgClient, mySlot, myStatus) {
  const query = `SELECT EXISTS (SELECT 1 FROM \"Reservations\" WHERE \"SlotID\" = $1 AND \"Status\" LIKE $2);`;
  const result = await pgClient.query(query, [mySlot, myStatus]);
  const isReserved = result.rows[0].exists;
  return isReserved;
}
async function queryCheckValidReservation(pgClient, mySlot, myCar) {
  const query = `SELECT EXISTS (SELECT 1 FROM \"Reservations\" WHERE \"SlotID\" = $1 AND \"CarID\" = $2 AND \"Status\" LIKE $3);`;
  const result = await pgClient.query(query, [mySlot, myCar, 'pending']);
  const isConfirmed = result.rows[0].exists;
  return isConfirmed;
}
async function queryInsertLogRow(pgClient, myCar, myReservation, myEndBy) {
  let query;
  const values = [myCar, null, 'NOW()', null, false, myReservation, myEndBy];

  if (Number.isInteger(myEndBy)) {
    // No reservation, time limit is a predefined number of hours
    query = `INSERT INTO \"ParkingLog\" \
            (\"CarID\", \"SlotID\", \"Entrance\", \"Exit\", \"Violation\", \"ReservationID\", \"NeedToExitBy\") \
            VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL \'${myEndBy} hours\') RETURNING *`;
    values.pop();
  } else {
    // Reservation found, time limit is a timestamp set in the DB
    query = `INSERT INTO \"ParkingLog\" \
            (\"CarID\", \"SlotID\", \"Entrance\", \"Exit\", \"Violation\", \"ReservationID\", \"NeedToExitBy\") \
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
  }
  await pgClient.query(query, values);
}
async function queryUpdateReservationStatus(pgClient, myCar, myStatus) {
  let query = '';
  if (myStatus == 'finished') {
    query = `DELETE FROM \"Reservations\" WHERE \"CarID\" = $1 `;
    await pgClient.query(query, [myCar]);
  } else {
    query = `UPDATE \"Reservations\" SET \"Status\" = $1 WHERE \"CarID\" = $2;`;
    await pgClient.query(query, [myStatus, myCar]);
  }
}
async function queryUpdateSlotBusy(pgClient, mySlot, myStatus) {
  const query = `UPDATE \"Slots\" SET \"Busy\" = $1 WHERE \"idSlots\" = $2;`;
  await pgClient.query(query, [myStatus, mySlot]);
}
async function queryUpdateViolation(pgClient, myCar, myStatus) {
  const query = `UPDATE \"ParkingLog\" SET \"Violation\" = $1 WHERE \"CarID\" = $2;`;
  await pgClient.query(query, [myStatus, myCar]);
}
async function queryUpdateViolationUser(pgClient, myCar) {
  const query = `UPDATE \"Users\" SET \"violations\" = \"violations\" + 1 \
        WHERE \"idUsers\" = (SELECT \"OwnerID\" FROM \"Cars\" WHERE \"idCars\" = $1);`;
  await pgClient.query(query, [myCar]);
}
async function queryUpdateLatestCarLog(pgClient, myCar) {
  const query =
    'UPDATE "ParkingLog" SET "Exit" = $1 WHERE "CarID" = $2 AND "Entrance" = \
            (SELECT MAX("Entrance") FROM "ParkingLog" WHERE "CarID" = $2)';
  await pgClient.query(query, ['NOW()', myCar]);
}
