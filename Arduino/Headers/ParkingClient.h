#ifndef PARKINGCLIENT_H
#define PARKINGCLIENT_H

#include <Arduino.h>
#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

class MyLotNode {
private:
    WebsocketsClient wsClient;
	const char* SSID = "inanforever";
	const char* PSWD = "0509232623";
	const char* websocket_server = "192.168.1.10";
	const uint16_t websocket_port = 5555;		
	IPAddress gateway(192, 168, 1, 1);    // Router's IP address (has to be verified for each network but certain conventions are common)
	IPAddress subnet(255, 255, 255, 0);   // Subnet mask for the local network
	IPAddress local_IP; // Manually set for current device (Ultrasonic Sensor on Entry). Has to be verified not to conflict with other devices.

public:
    MyLotNode(const IPAddress& ip);
    void networkSetup();	
    void connectWebSocket();
	uint16_t getDistance(int myTrig, int myEcho);
	void sendDistance(String myString, int myThreshold, uint16_t myDistance);
};

#endif
