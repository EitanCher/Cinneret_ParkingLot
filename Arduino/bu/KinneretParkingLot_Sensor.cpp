#include "KinneretParkingLot_Sensor.h"

ParkingSensor::ParkingSensor(const IPAddress& myIP) : MyLotNode(myIP) {}

uint16_t ParkingSensor::readDistance(int myTrig, int myEcho) {
	uint16_t duration;
	uint16_t distance;

	// Trigger the HC-SR04 to send an ultrasonic pulse:
	digitalWrite(myTrig, LOW);
	delayMicroseconds(2);
	digitalWrite(myTrig, HIGH);
	delayMicroseconds(10);
	digitalWrite(myTrig, LOW);

	// Read the echo time:
	duration = pulseIn(myEcho, HIGH); //Returns the length of the pulse in microseconds or 0 if no complete pulse was received within the timeout

	// Calculate the distance in centimeters
	distance = duration * 0.034 / 2;	// Sound speed is about 34mps
	Serial.print("Distance: ");
	Serial.print(distance);
	Serial.println(" cm");
	return distance;
}
