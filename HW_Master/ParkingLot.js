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


const WS_PORT = 5555;
const myLocalIP = getLocalIPAddress();
const wsServer = new webSocket.Server({port: WS_PORT}, ()=>console.log(`Websocket server is listening at ${WS_PORT}`));
let allBoards = {gates: [], gateCams: [], slots: [], slotCams: []};    // Empty arrays - to enable push command in fetchBoardsDataOnInit()
let disturbancesOnCameras = {};

// Detect disturbances on cameras:
for (board in disturbancesOnCameras) {
    if (disturbancesOnCameras[board] > 10) {
        console.log(`Disturbancy found on Camera ${board}`);
        disturbancesOnCameras[board] = 0;
    }
}
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
    ws.isAlive = true;
    let isPingable = true;
   
    // Send a ping to the client every 60 seconds:
    setInterval(() => {
        if (isPingable) {
            if (ws.isAlive === false) {
                console.log(`Client ${ip} did not respond to ping, terminating connection`);
                isPingable = false;
                connectionStatus(ip, ws, false);    // Mark as disconnected in allBoards
                return ws.terminate();
            }
        }
      
        ws.isAlive = false;
        console.log(`Sending ping to: ${ip}`)
        ws.ping();
    }, 60000);

    ws.on('pong', () => {
        ws.isAlive = true;
        isPingable = true;  // For cases of getting pong with too long delay
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
                console.log("=========== TEXT FROM IMAGE: ");
                console.log(imageText);
                await worker.terminate();
                const registrationID = await processImage(imageText, ip);
                if (registrationID != '') {
                    if (findKindOfBoard(ip) == 'gateCams')
                        await openGate(registrationID, ip);
                    else if (findKindOfBoard(ip) == 'slotCams'){

                    }
                }
            })();

        } 
        else {
            const message = data.toString();
            console.log('Received:', message);
            
            const nodePair = getNodePair(ip);
            const boardData_1 = nodePair[0];    // Get dictionary of connected board's data
            const boardData_2 = nodePair[1];    // Get dictionary of corresponding board's data

            if (!boardData_1.isFault) {
                if (!boardData_1.isConnected) boardData_1.isConnected = true;

                switch(message) {
                    case 'OBJECT_DETECTED':
                        if(boardData_2.wsc != null) {
                                boardData_2.wsc.send('TAKE_PICTURE');
                                console.log(`Trigger sent to camera ${boardData_2.ip}`);
                        } 
                        else {
                            console.log(`Camera ${boardData_2.ip} not connected.`);
                            // Unblock Gate's proximity sensor:
                            boardData_1.wsc.send('PREPARE_ANOTHER_SHOT');
                        }
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

// Update status of the node in the network:
function connectionStatus(inputIP, inputConn, isConn) {
    if (isConn) console.log("Clients already connected:");
    for (const boardsArray in allBoards) {
        const myArray = allBoards[boardsArray];
        for (const boardDict of myArray){
            // Find the metadata of the connected board by its IP:
            if(boardDict.ip === inputIP){
                boardDict.isConnected = isConn;
                if (isConn) {
                    if(boardDict.isConnected) console.log(boardDict.ip);
                    // Store the connection object:
                    boardDict.wsc = inputConn;
                    // Create key-value in the "disturbances" list (for cameras only):
                    if(boardsArray == 'gateCams' || boardsArray == 'slotCams')
                        disturbancesOnCameras[inputIP] = 0;
                }
                else {
                    if(disturbancesOnCameras.hasOwnProperty(inputIP)) 
                        delete disturbancesOnCameras.inputIP;
                }
            }
        }
    }
}

// Retrieve Parking-Lot nodes expected by the DB:
async function fetchBoardsDataOnInit() {
    console.log("Fetching data from the DB..................")
    const pgClient = await myDBPool.connect();
    try {
        const res1 = await pgClient.query('SELECT \"Fault\", \"CameraIP\", \"GateIP\", \"Entrance\" FROM \"Gates\";');
        const res2 = await pgClient.query('SELECT \"Fault\", \"CameraIP\", \"SlotIP\" FROM \"Slots\";');        
        
        // Purge the existing metadata:
        for (boardsArray in allBoards) boardsArray = [];

        // Store gates' and gateCams' metadata:
        res1.rows.forEach(row => {
            let myGateDict = {};
            let myGateCamDict = {};
            myGateDict.ip =    row.GateIP;
            myGateCamDict.ip = row.CameraIP;
            myGateDict.isFault =    row.Fault;
            myGateCamDict.isFault = row.Fault;
            myGateDict.isConnected =    false;
            myGateCamDict.isConnected = false;
            myGateDict.isEntry = row.Entrance;
            
            allBoards.gates.push(myGateDict); // Add the Gate dictionary into 'gates' array
            allBoards.gateCams.push(myGateCamDict); // Add the Gate Cam dictionary into 'gateCams' array
        });

        // Store slots' and slotCams' metadata:
        res2.rows.forEach(row => {
            let mySlotDict = {};
            let mySlotCamDict = {};
            mySlotDict.ip =    row.SlotIP;
            mySlotCamDict.ip = row.CameraIP;
            mySlotDict.isFault =    row.Fault;
            mySlotCamDict.isFault = row.Fault;
            mySlotDict.isConnected =    false;
            mySlotCamDict.isConnected = false;
            
            allBoards.slots.push(mySlotDict); // Add the Slot dictionary into 'slots' array
            allBoards.slotCams.push(mySlotCamDict); // Add the Slot Cam dictionary into 'slotCams' array
        });

        console.log("Boards data after \"Fetch\":")
        console.log(allBoards);
        console.log("*******   Fetch done   *********************")
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        // Release the client back to the pool after query accomplished
        await pgClient.release();
    }
}

function findKindOfBoard(inputIP) {
    for (let arrayName in allBoards) {
        if (allBoards[arrayName].some(item => item.ip === inputIP)) {
            // Return the name of the boards array ("gates" / "gateCams" / "slots" / "slotCams"):
            return arrayName;
        }
    }
    return null;  // Return null if not found
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
        for (const boardDict of myArray){
            if(boardDict.ip === inputIP){
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
    // Verify the Pattern is registered in the DB as a valid ID:
    const pgClient = await myDBPool.connect();
    try {
        const query = `SELECT \"idCars\" FROM \"Cars\" WHERE \"RegistrationID\" LIKE $1;`;
        const values = [`%${regID}%`];
        const result = await pgClient.query(query, values);

        if (result.rows.length > 0) {
            const carID = result.rows[0].idCars;
            console.log(`Found match for ${regID}: Car ID ${carID}`);
            // Find the Gate corresponding to the current camera and open it:
            const targetGate = getNodePair(inputIP)[1];
            targetGate.wsc.send('OPEN_GATE');

            // Update the Parking log:
            if (targetGate.isEntry) 
                logEntry(pgClient, carID);
            else 
                //logExit(pgClient, carID);
            
            console.log(`Trigger sent to open Gate ${inputIP}`);
        } 
        else {
            disturbancesOnCameras[inputIP] ++ ;
            // Find the gate corresponding to the current camera and unblock its proximity sensor:
            const targetGate = getNodePair(inputIP)[1];
            targetGate.wsc.send('PREPARE_ANOTHER_SHOT');
            console.log(`\nNo matches found for ${regID}, ready to take another shot\n`);
        }
    } catch (err) {
        console.error('Error executing query: ', err);
    } finally {
        // Release the client back to the pool after query accomplished:
        await pgClient.release();
    }
}

// Retrieve text from Image:
async function processImage(imageText, inputIP) { 
    const myPattern1 = imageText.match(/\d{2}\W\d{3}\W\d{2}/); // ID pattern: "12-345-67"
    const myPattern2 = imageText.match(/\d{3}\W\d{2}\W\d{3}/); // ID pattern: "123-45-678"
    let myPattern = '';
     
    // Check if any Pattern occurs in the Image Text:
    if (myPattern1 == null && myPattern2 == null) {
        disturbancesOnCameras[inputIP] ++ ;
        
        // Find the gate corresponding to the current camera and unblock its proximity sensor:
        const targetGate = getNodePair(inputIP)[1];
        targetGate.wsc.send('PREPARE_ANOTHER_SHOT');
        console.log("\nPattern not found, ready to take another shot\n");

        return '';
    }
    
    if (myPattern1 != null) myPattern = myPattern1;
    if (myPattern2 != null) myPattern = myPattern2;
    
    const regID = String(myPattern).replace(/\W/g, ''); // Remove the non-alphabetical characters
    console.log(`Pattern found: ${regID}`);
    disturbancesOnCameras[inputIP] = 0;
    return regID;
}

// Add a row into Parking-Log table in the DB:
async function logEntry(pgClient, carID){
    // Check if Reservation exists for current car:
    let reservationID = null;
    let duration = 6;
    try {
        const query = `SELECT \"idReservation\" FROM \"Reservations\" WHERE \
            \"CarID\" = ${carID} AND \"ReservationStart\" < NOW() AND \"ReservationEnd\" > NOW();`;
        
        const result = await pgClient.query(query);            
        if (result.rows.length > 0) {
            reservationID = result.rows[0].idReservation;
            duration = 24; 
            console.log(`Reservation found for this car (id ${reservationID})`);
        }
        else console.log("No reservations found for this car");
    }
    catch (err) {
        console.error('Error executing Reservations-check query: ', err);
    }

    // Insert a row into Parking Log table having all the required values set:
    try {
        const query = `INSERT INTO \"ParkingLog\" \
            (\"CarID\", \"SlotID\", \"Entrance\", \"Exit\", \"Violation\", \"ReservationID\", \"NeedToExitBy\") \
            VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL \'${duration} hours\') RETURNING *`;
        
        // Values to insert (this is to avoid SQL injection):
        const values = [carID, null, 'NOW()', null, false, reservationID];

        // Execute the query
        await pgClient.query(query, values);            
    }
    catch (err) {
        console.error('Error executing ParkingLog-update query: ', err);
    }
}

