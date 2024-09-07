const path = require('path');
const express = require('express');
const webSocket = require('ws');
const app = express();
const os = require('os');
const myDBPool = require('./db_config');

const WS_PORT = 5555;
const HTTP_PORT = 8000;

const wsServer = new webSocket.Server({port: WS_PORT}, ()=>console.log(`Websocket server is listening at ${WS_PORT}`));
let allBoards = {gates: [], gateCams: [], slots: [], slotCams: []};    // Empty arrays - to enable push command in fetchNodesData()

// Get local IP address:
console.log('Local IP Address:', getLocalIPAddress());

// Get the list of boards registered at the DB:
fetchBoardsDataOnInit();

// WebSocket server logic:
wsServer.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress.replace('::ffff:', ''); // Get client IP address
    console.log('New client connected:', ip);
    // Store the client in allBoards and return data of itself and its node-"partner"
    const nodePair = connectionStore(ip, ws);
    const boardData_1 = nodePair[0];    // Get dictionary of connected board's data
    const boardData_2 = nodePair[1];    // Get dictionary of corresponding board's data
    
    ws.on('message', (data) => {
        const message = data.toString();
        console.log('Received:', message);
        
        if (!boardData_1.isConnected) {
            boardData_1.isConnected = true;
        }
        if (boardData_1.isActive && message === 'entry_event') {
            console.log("trigggger");
        }
    });
  
    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

// Wait for 5sec to let the clients to establish connections:
setTimeout(() => {
    console.log('Waiting for 5 sec to let clients establish connections.....');
  
    // Iterate through the clients and send a trigger to postpone their next rollcall:
    for (const boardsArray in allBoards)
        allBoards[boardsArray].forEach((board) => {
            if (board.readyState === webSocket.OPEN) 
                board.send(`INITIAL_CONNECTION_ESTABLISHED`);
        });
}, 5000);  // 5-second delay

async function fetchBoardsDataOnInit() {
    console.log("Fetching data from the DB..................")
    try {
        await myDBPool.connect();
        const res1 = await myDBPool.query('SELECT \"Fault\", \"CameraIP\", \"GateIP\" FROM \"Gates\";');
        const res2 = await myDBPool.query('SELECT \"Fault\", \"CameraIP\", \"SlotIP\" FROM \"Slots\";');        
        
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
            
            allBoards.gates.push(myGateDict); // Add the Gate dictionary into 'gates' array
            allBoards.gateCams.push(myGateCamDict); // Add the Gate Cam dictionary into 'gateCams' array
        });

        // Store slots' and slotCams' metadata:
        res2.rows.forEach(row => {
            let mySlotDict = {};
            let mySlotCamDict = {};
            mySlotDict.ip =    row.GateIP;
            mySlotCamDict.ip = row.CameraIP;
            mySlotDict.isFault =    row.Fault;
            mySlotCamDict.isFault = row.Fault;
            mySlotDict.isConnected =     false;
            mySlotCamDicts.isConnected = false;
            
            allBoards.slots.push(mySlotDict); // Add the Slot dictionary into 'slots' array
            allBoards.slotCams.push(mySlotCamDict); // Add the Slot Cam dictionary into 'slotCams' array
        });

        console.log("Gates data by the query:"); 
        console.log(res1.rows); 
        console.log("Slots data by the query:"); 
        console.log(res2.rows);
        console.log("======================================================="); 
        console.log("Boards data after \"Fetch\":")
        console.log(allBoards);
        console.log("*******   Fetch done   *********************")
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        // Close the database connection
        await myDBPool.end();
    }
}

function connectionStore(inputIP, inputConn) {
    // Map the nodes pairs:
    const pairsMap = {
        gates: 'gateCams',
        gateCams: 'gates',
        slots: 'slotCams',
        slotCams: 'slots'
    };
    
    for (const boardsArray in allBoards) {
        const myArray = allBoards[boardsArray];
        for (const boardDict of myArray){
            console.log(boardDict.ip);
            // Find the metadata of the connected board by its IP:
            if(boardDict.ip === inputIP){
                boardDict.isConnected = true;
                // Store the connection object:
                boardDict.wsc = inputConn;
                // Find corresponding board (Camera for Node / Node for Camera):
                const myIndex = myArray.indexOf(boardDict);
                const correspondingArray = pairsMap[boardsArray];
                const correspondingBoard = allBoards[correspondingArray][myIndex];
                return [boardDict, correspondingBoard];
            }
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


