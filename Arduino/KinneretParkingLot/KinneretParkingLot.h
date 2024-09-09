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
	const uint16_t websocket_port = 5555;
	uint16_t distance;
	const int rollcallInterval = 600000;
	bool takePicture = false;
	IPAddress gateway = IPAddress(192, 168, 1, 1);    // Router's IP address (has to be verified for each network but certain conventions are common)
	IPAddress subnet = IPAddress(255, 255, 252, 0);   // Subnet mask for the local network

	WiFiMulti wifiMulti;
    WebsocketsClient wsClient;

    // Declared to support the constructor syntax:
	IPAddress local_IP;


public:
    MyLotNode(const IPAddress& myIP);
    void networkSetup();
	void onMessageCallback(WebsocketsMessage input);
    void defineWSClient();
	void rollcall();
	void readDistance(int myTrig, int myEcho);
	void sendDistance(String myString, int myThreshold, int myTrig, int myEcho);
    int getInterval() const { return rollcallInterval; }
	bool isShotRequired() { return takePicture; }
//	bool isShotRequired() const { return takePicture; }
	void setShotRequire(bool b) { takePicture = b; }
};

#endif
