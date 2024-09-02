#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoWebsockets.h>
#include <KinneretParkingLot.h>

// A switch between Entrance / Exit mode of the Gate. Set to enable using one board for both cases due to HW restrictions of the project
#define GATE_SWITCH 2
#define SWITCH_EXIT 4
// HC-SR04 (ultrasonic sensor) pins:
#define PIN_TRIG_ENTR 19
#define PIN_ECHO_ENTR 18
#define PIN_TRIG_EXIT 5
#define PIN_ECHO_EXIT 17
// Distance threshold in centimeters:
#define THRESHOLD_GATE 20
#define THRESHOLD_SLOT 20

//Create an object for Client:
IPAddress local_IP(192, 168, 1, 200); // Manually set for current device (Ultrasonic Sensor on Entry). Has to be verified not to conflict with other devices.
MyLotNode myClient(local_IP);

void setup() {
  Serial.begin(9600);
  Serial.println("Starting....................");
  
  // Initialize the pins:
  pinMode(GATE_SWITCH, INPUT_PULLUP);
  pinMode(SWITCH_EXIT, INPUT_PULLUP);
  pinMode(PIN_TRIG_ENTR, OUTPUT);
  pinMode(PIN_ECHO_ENTR, INPUT);
  pinMode(PIN_TRIG_EXIT, OUTPUT);
  pinMode(PIN_ECHO_EXIT, INPUT);

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
  if (gateState == LOW) { // GATE_SWITCH pin is connected to ground
    Serial.println("Acting as Entry Gate -------------------------------");
    // Read the ultrasonic on Entry gate and send to server if an object detected:
    myClient.sendDistance("entry", THRESHOLD_GATE, PIN_TRIG_ENTR, PIN_ECHO_ENTR);
  } else {
    Serial.println("Acting as Exit Gate -------------------------------");
    // Read the ultrasonic on Exit gate and send to server if an object detected:
    myClient.sendDistance("exit", THRESHOLD_GATE, PIN_TRIG_EXIT, PIN_ECHO_EXIT);
  }
  
  delay(2000);
}

