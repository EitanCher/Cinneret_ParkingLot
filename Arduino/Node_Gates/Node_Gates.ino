#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <KinneretParkingLot.h>

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

//MyLotNode myClient;
IPAddress local_IP(192, 168, 2, 255); // Manually set for current device (Ultrasonic Sensor on Entry). Has to be verified not to conflict with other devices.
MyLotNode myClient(local_IP);

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
  myClient.networkSetup();

  // Connect to the server:
  myClient.connectWebSocket();
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
  uint16_t distanceEntry = myClient.getDistance(TRIG_PIN_ENTR, ECHO_PIN_ENTR);
	myClient.sendDistance("entry", THRESHOLD_GATE, distanceEntry);
  
  // Read the ultrasonic on Exit gate and send to server if an object detected:
  uint16_t distanceExit = myClient.getDistance(TRIG_PIN_EXIT, ECHO_PIN_EXIT);
	myClient.sendDistance("exit", THRESHOLD_GATE, distanceExit);

  delay(2000);
}

