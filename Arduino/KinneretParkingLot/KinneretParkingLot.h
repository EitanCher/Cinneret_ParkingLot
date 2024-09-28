#ifndef PARKINGCLIENT_H
#define PARKINGCLIENT_H

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

class MyLotNode {
protected:
	const char* 	SSID = "*********";
	const char* 	PSWD = "*********";
	const char* 	websocket_server = "192.168.110.3";
	const uint16_t	websocket_port = 5555;
	const uint32_t	connectionTimeout = 300000; // Set timeout to 5 minutes
	unsigned long 	connectionStartTime = 0;
	const uint32_t	rollcallInterval = 60000;
	unsigned long 	timer = 0;
	bool			isConnectionSuccess = true;
	IPAddress		gateway =	IPAddress(192, 168, 110, 1);    // Router's IP address (has to be verified for each network but certain conventions are common)
	IPAddress		subnet =	IPAddress(255, 255, 252, 0);   // Subnet mask for the local network

	WiFiMulti wifiMulti;
	WebsocketsClient wsClient;

	// Declared to support the constructor syntax:
	IPAddress local_IP;


public:
	MyLotNode(const IPAddress& myIP);
	virtual void onMessageCallback(WebsocketsMessage message) = 0;
		// Syntax memo: 
		//The above is Pure Virtual function.
		//It makes class MyLotNode to be abstract.
		//Every child class has to implement this function even if empty.
	void 	connectToServer();
	void 	defineWSClient();
	int 	getInterval() const { return rollcallInterval; }
	void 	handle();
	bool	isConnectionSucceed() { return isConnectionSuccess; }
	void 	networkSetup();
	void 	rollcall();
};

#endif
