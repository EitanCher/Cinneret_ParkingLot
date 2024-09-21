#ifndef PARKINGCLIENT_H
#define PARKINGCLIENT_H

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

class MyLotNode {
private:
	const char* SSID = "inanforever";
	const char* PSWD = "0509232623";
	const char* websocket_server = "192.168.1.10";
	//const char* websocket_server = "172.21.160.1";
	const uint16_t websocket_port = 5555;
	const unsigned long connectionTimeout = 300000; // Set timeout to 5 minutes
	unsigned long connectionStartTime = 0;
	uint16_t distance;
	const unsigned long rollcallInterval = 60000;
	unsigned long timer = 0;
	bool flag_openGate = false;
	bool flag_takePicture = false;
	bool isGateOpen = false;
	bool isConnectionSuccess = true;
	IPAddress gateway = IPAddress(192, 168, 1, 1);    // Router's IP address (has to be verified for each network but certain conventions are common)
	IPAddress subnet = IPAddress(255, 255, 252, 0);   // Subnet mask for the local network

	WiFiMulti wifiMulti;
	WebsocketsClient wsClient;

    // Declared to support the constructor syntax:
	IPAddress local_IP;


public:
	MyLotNode(const IPAddress& myIP);
	void 	connectToServer();
	void 	defineWSClient();
	int 	getInterval() const { return rollcallInterval; }
	void 	handle();
	bool	isConnectionSucceed() { return isConnectionSuccess; }
	bool 	isOpenRequired() { return flag_openGate; }
	bool 	isShotRequired() { return flag_takePicture; }
	void 	networkSetup();
	void 	onMessageCallback(WebsocketsMessage message);
	void 	readDistance(int myTrig, int myEcho);
	void 	rollcall();
	void 	sendDistance(String myString, int myThreshold, int myTrig, int myEcho);
	void 	sendPicture(const char* data, const size_t len);
	void 	setGateStatus(bool b) { isGateOpen = b; }
	void 	setOpenRequest(bool b) { flag_openGate = b; }
	void 	setShotRequire(bool b) { flag_takePicture = b; }
};

#endif
