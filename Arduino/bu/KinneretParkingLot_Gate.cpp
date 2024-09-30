#include "KinneretParkingLot_Gate.h"

ParkingGate::ParkingGate(const IPAddress& myIP) : ParkingSensor(myIP) {}

void ParkingGate::onMessageCallback(WebsocketsMessage message) {
	String msg = message.data();
	String log = "Message received: " + message.data();
	Serial.println(log);
	if (msg == "PREPARE_ANOTHER_SHOT") {
		this->flag_gateOpen = false;
		this->block_usonic = false;
	}
	else if (msg == "OPEN_GATE") {
		this->flag_gateOpen = true;
		this->block_usonic = false;
	}
}

void ParkingGate::checkDistance(String myString, int myThreshold, int myTrig, int myEcho) {  
	if (!block_usonic) {
		uint16_t distance = readDistance(myTrig, myEcho);
  
		if (distance > 0 && distance < myThreshold) {
			Serial.print("Object detected on ");
			Serial.println(myString);
			if (!this->flag_gateOpen) {
				wsClient.send("OBJECT_DETECTED");	// Trigger the camera
				block_usonic = true;	// Stop measuring proximity
			}
		}
		else if (distance <= 0) {
			if (!this->flag_gateOpen) {
				wsClient.send("0_DISTANCE");
			}
		}
		else {	// No object detected by the sensor
			if (this->flag_gateOpen) {	// If Gate is open, close it:
				this->flag_gateOpen = false;
				this->flag_gateClose = true;
			}
		}
	}
	else Serial.println("Proximity measurement blocked");
}
