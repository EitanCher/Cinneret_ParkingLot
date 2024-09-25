#include "KinneretParkingLot_Slot.h"

Slot::Slot(const IPAddress& myIP) : Gate(myIP) {}

void Slot::onMessageCallback(WebsocketsMessage message) {}

void Slot::checkDistance(String myString, int myThreshold, int myTrig, int myEcho) {  
	this->readDistance(myTrig, myEcho);

	if (this->distance > 0 && this->distance < myThreshold) {
		Serial.print("Object detected on ");
		Serial.println(myString);
		if (!this->flag_gateOpen) {
			wsClient.send("OBJECT_DETECTED");	// Trigger the camera
			this->block_usonic = true;	// Stop measuring proximity
		}
	}
	else if (this->distance == 0) {
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
