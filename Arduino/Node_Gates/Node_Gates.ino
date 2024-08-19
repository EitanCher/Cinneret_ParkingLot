#include <WiFi.h>
#include <ArduinoWebsockets.h>
//#include <ParkingLotFunctions.h>
#include "../ParkingLotFunctions.h"

// A switch between Entrance / Exit mode of the Gate. Set to enable using one board for both cases due to HW restrictions of the project
#define GATE_SWITCH 4
// HC-SR04 (ultrasonic sensor) pins:
#define TRIG_PIN_ENTR 19
#define ECHO_PIN_ENTR 18
#define TRIG_PIN_EXIT 5
#define ECHO_PIN_EXIT 17
// Distance threshold in centimeters:
#define THRESHOLD_GATE 20
#define THRESHOLD_SLOT 20

IPAddress local_IP(192, 168, 2, 255); // Manually set for current device (Ultrasonic Sensor on Entry). Has to be verified not to conflict with other devices.

using namespace websockets;
WebsocketsClient wsclient;

void setup() {
  Serial.begin(9600);
  Serial.println("Starting....................");
  
  // Initialize the pins:
  pinMode(GATE_SWITCH, INPUT_PULLUP);
  pinMode(TRIG_PIN_ENTR, OUTPUT);
  pinMode(ECHO_PIN_ENTR, INPUT);
  pinMode(TRIG_PIN_EXIT, OUTPUT);
  pinMode(ECHO_PIN_EXIT, INPUT);

  //Initiate the WIFI connection:
  //wifi_Setup();
  networkSetup(&local_IP, &wsclient);
}

void loop() {
  Serial.println("this is loop");

  // Read the state of the switch
  int gateState = digitalRead(GATE_SWITCH);
  
  // Check the mode of the Gate:
  if (gateState == LOW)  // GATE_SWITCH pin is connected to ground
    Serial.println("Acting as Entry Gate -------------------------------");
  else Serial.println("Acting as Exit Gate -------------------------------");

  // Read the ultrasonic on Entry gate and send to server if an object detected:
  long distanceEntry = DistanceRead(TRIG_PIN_ENTR, ECHO_PIN_ENTR);
  DistanceSend("entry", THRESHOLD_GATE, distanceEntry, &wsclient);
  
  // Read the ultrasonic on Exit gate and send to server if an object detected:
  long distanceExit = DistanceRead(TRIG_PIN_EXIT, ECHO_PIN_EXIT);
  DistanceSend("exit", THRESHOLD_GATE, distanceExit, &wsclient);
/*
  long duration, distance;

  // Trigger the HC-SR04 to send an ultrasonic pulse:
  digitalWrite(TRIG_PIN_ENTR, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN_ENTR, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN_ENTR, LOW);

  // Read the echo time
  duration = pulseIn(ECHO_PIN_ENTR, HIGH); //Returns the length of the pulse in microseconds or 0 if no complete pulse was received within the timeout

  // Calculate the distance in centimeters
  distance = duration * 0.034 / 2;	// Sound speed is about 34mps
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  if (distance > 0 && distance < DISTANCE_THRESHOLD) {
    Serial.println("object detected");
    wsclient.send("entry_event!");
  }
  else if (distance == 0) wsclient.send("0_distance");
  else wsclient.send("no_object");
*/
  delay(2000);
}

