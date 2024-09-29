#include "KinneretParkingLot_Slot.h"

ParkingSlot::ParkingSlot(const IPAddress& myIP) : ParkingSensor(myIP) {
	updateStage(0);
	// Stages breakdown:
	// 	0: (true)	No parking detected
	// 	1: (false)	Waiting for 1 minute to accomplish parking attempt
	// 	2: (false)	Waiting for the parking to be finished
}

void ParkingSlot::updateStage(int myStage) {
	for (int i = 0; i < 3; i++) { parkStages[i] = false; }
	parkStages[myStage] = true;
}

void ParkingSlot::onMessageCallback(WebsocketsMessage message) {
	String msg = message.data();
	String log = "Message received: " + message.data();
	Serial.println(log);
	
	if (msg == "PARKING_ATTEMPT_ACKNOWLEDGED") {
		this->block_usonic = false;
		this->updateStage(1);	// Move to stage 1 (Waiting to accomplish parking attempt)
		this->timerStart = millis();
	}
	else if (msg == "PARKING_SUCCESS_ACKNOWLEDGED") {
		block_usonic = false;
		Serial.println("Parking acknowledged by the Server");
		this->updateStage(2);	// Move to stage 2 (Waiting for the parking to be finished)
	}
	else if (msg == "PREPARE_ANOTHER_SHOT") { this->block_usonic = false; }
	else if (msg == "RESERVATION_ON") 		{ this->isReserved = true; }
	else if (msg == "RESERVATION_OFF") 		{ this->isReserved = false; }
	else if (msg == "VIOLATION_ON") { 
		this->isViolated = true; 
		this->updateStage(2);	// Move to stage 2 (Waiting for the parking to be finished)
		this->block_usonic = false;
	}
}

void ParkingSlot::checkDistance(String myString, int myThreshold, int myTrig, int myEcho) {  
	if (!block_usonic) {
		uint16_t distance = readDistance(myTrig, myEcho);

		if (distance > 0 && distance < myThreshold) {
			this->isFree = false;
			if (parkStages[0]) {
				Serial.print("New object detected on the slot");
				wsClient.send("PARKING_ATTEMPT_DETECTED");	// Trigger the camera
				block_usonic = true;	// Stop measuring proximity
			}
			else if (parkStages[1]) {
				Serial.print("Waiting for parking attempt to be accomplished");
				if(millis() - this->timerStart >= this->limitAttemptDuration) {
					Serial.print("Parking attempt succeeded");				
					wsClient.send("PARKING_ATTEMPT_SUCCESS");	// Trigger the camera
					block_usonic = true;	// Stop measuring proximity
				}
			}
			else if (parkStages[2]) {
				Serial.println("Slot is in use  **************");
				block_usonic = false;
			}
		}
		else if (distance <= 0) { 
			this->isFree = false;
			wsClient.send("0_DISTANCE"); 
		}
		else {	// No object detected by the sensor
			// Make several attempts in case of occasional interrupt:
			if(!this->isFree && (this->cntAttempts++ >= this->limitAttempts)) {
				this->updateStage(0);	// Reset the stages
				wsClient.send("PARKING_FINISHED");
				Serial.println("Exit from slot detected =============");
				this->isFree = true;
				this->isViolated = false;
			}
		}
	}
	else Serial.println("Proximity measurement blocked");
}