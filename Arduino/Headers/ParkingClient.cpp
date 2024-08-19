#include "ParkingClient.h"

MyLotNode::MyLotNode(const IPAddress& ip) {
    : local_IP(ip) {
    // Syntax memo:
	// the constructor accepts an IPAddress object by reference, which avoids copying the object. 
	// ': local_IP(ip)' is a member initializer list, used to initialize member variables of a class before the constructor body runs
}

void MyLotNode::networkSetup() {
	Serial.println("WIFI Setup started");

	// Configure static IP for the current Sensor Node:
	if (!WiFi.config(this->local_IP, this->gateway, this->subnet)) Serial.println("STA Failed to configure");

	WiFi.begin(this->SSID, this->PSWD);

	while (WiFi.status() != WL_CONNECTED) {
		Serial.println("Attempting to connect to network...");
		delay(100);
	}
	Serial.println("Connected to network");
	Serial.print("Local IP: ");
	Serial.println(local_IP);
}

void MyLotNode::connectWebSocket() {
	while(!this->wsClient.connect(this->websocket_server, this->websocket_port, "/")) {
		delay(100);
		Serial.println(".... Attempting to connect to websocket server ....");
	}
	Serial.println("Websocket server connected");
}

uint16_t MyLotNode::getDistance(int myTrig, int myEcho) {
  uint16_t duration, distance;

  // Trigger the HC-SR04 to send an ultrasonic pulse:
  digitalWrite(myTrig, LOW);
  delayMicroseconds(2);
  digitalWrite(myTrig, HIGH);
  delayMicroseconds(10);
  digitalWrite(myTrig, LOW);

  // Read the echo time
  duration = pulseIn(myEcho, HIGH); //Returns the length of the pulse in microseconds or 0 if no complete pulse was received within the timeout

  // Calculate the distance in centimeters
  distance = duration * 0.034 / 2;	// Sound speed is about 34mps
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  return distance;
}

void MyLotNode::sendDistance(String myString, int myThreshold, uint16_t myDistance) {
  // Passing 'myClient' by pointer allows NULL values
  String msg_event = myString + "_event";
  String msg_zero = myString + "_0_distance";
  if (myDistance > 0 && myDistance < myThreshold) {
    Serial.print("Object detected on ");
    Serial.println(myString);
    this->wsClient.send(msg_event);
  }
  else if (myDistance == 0) this->wsClient.send(msg_zero);
  //else this->wsClient.send("no_object");
}
