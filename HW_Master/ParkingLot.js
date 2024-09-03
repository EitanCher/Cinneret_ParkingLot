const path = require('path');
const express = require('express');
const webSocket = require('ws');
const app = express();
const myDBPool = require('./db_config');

const WS_PORT = 5555;
const HTTP_PORT = 8000;

const wsServer = new webSocket.Server({port: WS_PORT}, ()=>console.log(`Websocket server is listening at ${WS_PORT}`));

// Get local IP address =======================
const os = require('os');
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
console.log('Local IP Address:', getLocalIPAddress());
// =============================================

let lotClients = {gates: [], gateCams: [], slots: [], slotCams: []};    // Empty arrays - to enable push command in fetchNodesData()
fetchNodesData();


function findNodePair(inputIP) {
    // Map the nodes pairs:
    const pairsMap = {
        gates: 'gateCams',
        gateCams: 'gates',
        slots: 'slotCams',
        slotCams: 'slots'
    };
    
    for (const key in lotClients) {
        // Find the metadata of the connected client by its IP:
        const client1 = lotClients[key].find(item => item.ip === inputIP);
        if (client1) {
            // Find metadata of the corresponding client (same index as client1 but in the correspoing array)
            const myIndex = lotClients[key].indexOf(client1);
            const correspondingKey = pairsMap[key];
            const client2 = lotClients[correspondingKey][myIndex];
            return [client1, client2];
        }
    }
    return null;
}

// WebSocket server logic
wsServer.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress.replace('::ffff:', ''); // Get client IP address
    const clientsPair = findNodePair(ip);
    const clientDict_1 = clientsPair[0];    // Get the connected Client's metadata from lotClients
    const clientDict_2 = clientsPair[1];    // Get the corresponding Client's metadata from lotClients

    
    console.log('New client connected:', ip);
    
    ws.on('message', (data) => {
        const message = data.toString();
        console.log('Received:', message);
        
        if (!clientDict_1.isConnected) clientDict_1.isConnected = true;
        if (clientDict_1.isActive && message === 'entry_event') {
            console.log("trigggger");
        }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected.');

        // Clear the cameraClient reference if it disconnects
        if (ws === cameraClient) {
            cameraClient = null;
        }
    });
});

async function fetchNodesData() {
    try {
        await myDBPool.connect();
        const res1 = await myDBPool.query('SELECT \"Fault\", \"CameraIP\", \"GateIP\" FROM \"Gates\";');
        console.log(res1.rows); // Display the result
        const res2 = await myDBPool.query('SELECT \"Fault\", \"CameraIP\", \"SlotIP\" FROM \"Slots\";');

        // Store gates' and gateCams metadata:
        res1.rows.forEach(row => {
            let myGateDict = {};
            let myGateCamDict = {};
            myGateDict.ip =    row.GateIP;
            myGateCamDict.ip = row.CameraIP;
            myGateDict.wsc =    null;
            myGateCamDict.wsc = null;
            myGateDict.isFault =    row.Fault;
            myGateCamDict.isFault = row.Fault;
            myGateDict.isConnected =    false;
            myGateCamDict.isConnected = false;
            
            lotClients.gates.push(myGateDict); // Add the Gate dictionary into 'gates' array
            lotClients.gateCams.push(myGateCamDict); // Add the Gate Cam dictionary into 'gateCams' array
        });

        // Store slots' and slotCams metadata:
        res2.rows.forEach(row => {
            let mySlotDict = {};
            let mySlotCamDict = {};
            mySlotDict.ip =    row.GateIP;
            mySlotCamDict.ip = row.CameraIP;
            mySlotDict.wsc =    null;
            mySlotCamDict.wsc = null;
            mySlotDict.isFault =    row.Fault;
            mySlotCamDict.isFault = row.Fault;
            mySlotDict.isConnected =    false;
            mySlotCamDicts.isConnected = false;
            
            lotClients.slots.push(mySlotDict); // Add the Slot dictionary into 'slots' array
            lotClients.slotCams.push(mySlotCamDict); // Add the Slot Cam dictionary into 'slotCams' array
        });

    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        // Close the database connection
        await myDBPool.end();
  }
}


  
