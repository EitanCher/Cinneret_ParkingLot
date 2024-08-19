// Prevent multiple inclusions of the header file:
//#ifndef MY_FUNCTIONS_H
  //#define MY_FUNCTIONS_H

#include <Arduino.h>
#include <WiFi.h>
#include <ArduinoWebsockets.h>

const char* SSID = "inanforever";
const char* PSWD = "0509232623";
const char* websocket_server = "192.168.1.10";
const uint16_t websocket_port = 5555;

IPAddress gateway(192, 168, 1, 1);    // Router's IP address (has to be verified for each network but certain conventions are common)
IPAddress subnet(255, 255, 255, 0);   // Subnet mask for the local network

void networkSetup(IPAddress *local_IP, WebsocketsClient *myClient) {
//void networkSetup(IPAddress *local_IP, websockets::WebsocketsClient *myClient) {
  Serial.println("wifiSetup started");

  // Configure static IP for the current Sensor Node:
  if (!WiFi.config(local_IP, gateway, subnet)) Serial.println("STA Failed to configure");

  WiFi.begin(SSID, PSWD);

  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("Attempting to connect to network...");
    delay(100);
  }
  Serial.println("Connected to network");
  Serial.print("Local IP: ");
  Serial.println(local_IP);

  while(!myClient.connect(websocket_server, websocket_port, "/")) {
    delay(100);
    Serial.print(".. ");
  }
  Serial.println("Websocket connected");
}

long DistanceRead(int myTrig, int myEcho) {
  long duration, distance;

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

void DistanceSend(String myString, int myThreshold, long myDistance, WebsocketsClient *myClient) {
  // Passing 'myClient' by pointer allows NULL values
  String msg_event = myString + "_event";
  String msg_zero = myString + "_0_distance";
  if (myDistance > 0 && myDistance < myThreshold) {
    Serial.print("Object detected on ");
    Serial.println(myString);
    myClient.send(msg_event);
  }
  else if (myDistance == 0) myClient.send(msg_zero);
  //else myClient.send("no_object");
}
