const path = require('path');
const express = require('express');
const webSocket = require('ws');
const app = express();

const WS_PORT = 5555;
const HTTP_PORT = 8000;

const wsServer = new webSocket.Server({port: WS_PORT}, ()=>console.log(`Websocket server is listening at ${WS_PORT}`));
//const wsServer = new WebSocket.Server({ noServer: true });


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

let lotClients = {
    clientsEntry :      [{ip: '192.168.1.2', wsc: null, isActive: true, isConnected: true}],
    clientsEntryCam :   [{ip: '192.168.1.3', wsc: null, isActive: true, isConnected: true}],
    clientsExit :       [{ip: '192.168.1.4', wsc: null, isActive: true, isConnected: true}],
    clientsExitCam :    [{ip: '192.168.1.5', wsc: null, isActive: true, isConnected: true}],
    clientsSlot :       [{ip: '192.168.1.6', wsc: null, isActive: true, isConnected: true}, {ip: '192.168.1.7', wsc: null, isActive: true, isConnected: true}],
    clientsSlotCam :    [{ip: '192.168.1.8', wsc: null, isActive: true, isConnected: true}, {ip: '192.168.1.9', wsc: null, isActive: true, isConnected: true}]
}

function findClientByIP(ip) {
    for (const key in lotClients) {
        const myClient = lotClients[key].find(item => item.ip === ip);
        if (myClient) 
          return myClient;
    }
    return null;
  }

// WebSocket server logic
wsServer.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress.replace('::ffff:', ''); // Get client IP address
    const myClientDict = findClientByIP(ip);    // Get Client's metadata from lotClients

    
    console.log('New client connected:', ip);
    
    ws.on('message', (data) => {
        const message = data.toString();
        console.log('Received:', message);
  
        if (myClientDict.isActive && message === 'entry_event') {
            console.log("trigggger");
            /*if (secondClient) {
                secondClient.send('Trigger action');
            }*/
            // Send a message to the ESP32 camera client to take a snapshot
            /*
            if (clientCamEntry) {
                clientCamEntry.send('TRIGGER');
                console.log('TRIGGER command sent to Entry camera client.');
            } else { console.log('Entry camera client not connected.'); }
        } else if (message === 'CAMERA_CONNECTED') {
            clientCamEntry = ws;
            console.log('Camera client identified.');
            */
        }
    });
  /*
    // Identify the second ESP32 client
    ws.on('message', (message) => {
      if (message === 'I am the second client') {
        secondClient = ws;
        console.log('Second client connected');
      }
    });*/
  
    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected.');

        // Clear the cameraClient reference if it disconnects
        if (ws === cameraClient) {
            cameraClient = null;
        }
    });
});
  
  
/*  
// WebSocket server logic
    wsServer.on('connection', (ws, req) => {
    console.log('Connected');
    lotClients.push(ws);

    // If there is a message from one of the clients, send it to all the clients:
    ws.on('message', data => {
        lotClients.forEach((ws, i) => {
            if(ws.readyState === ws.OPEN) {
                ws.send(data);
            } 
            // If a client doesn't have an opened connection, remove it from the array:
            else {
                lotClients.splice(i, 1);
            }
        })
    });
});
*/

// Serve HTML file:
const server = app.get('/entry_us', (req, res) => res.sendFile(path.resolve(__dirname, './index.html')));
// Listen for client's HTTP connection:
app.listen(HTTP_PORT, ()=>console.log(`HTTP server is listening at ${HTTP_PORT}`));

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
    });
});
  
