#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoWebsockets.h>
#include <KinneretParkingLot.h>
#include <ESP32Servo.h>

// === Pins Definitions: =====================================================
// Servo pins:
#define PIN_SERVO_ENTR 23
#define PIN_SERVO_EXIT 22
// A switch between Entrance / Exit mode of the Gate. Set to enable using one board for both cases due to HW restrictions of the project
#define SWITCH_ENTR 2
#define SWITCH_EXIT 4
// HC-SR04 (ultrasonic sensor) pins:
#define PIN_TRIG_ENTR 19
#define PIN_ECHO_ENTR 18
#define PIN_TRIG_EXIT 5
#define PIN_ECHO_EXIT 17
// Distance threshold in centimeters:
#define THRESHOLD_GATE 20
#define THRESHOLD_SLOT 20

bool isEntr = false, isExit = false;  // Need both of them to enable the first toggle between the modes (next code line)

// Local IPs are manually set for current devices (Ultrasonic Sensors on Entry/Exist). 
// The IPs have to be verified not to conflict with other devices.
// The IPs have to match the relevant data in the DB
IPAddress local_IP_entr(192, 168, 1, 2); 
IPAddress local_IP_exit(192, 168, 1, 3);

// === Create objects for Clients: ==========================================
MyLotNode myClient_Entry(local_IP_entr);
MyLotNode myClient_Exit(local_IP_exit);

// === Create objects for Servo Motors: =====================================
Servo servoEntry;
Servo servoExit;

void setup() {
  Serial.begin(9600);
  Serial.println("Starting....................");

  // Initialize Servo pins:
  servoEntry.attach(PIN_SERVO_ENTR);
  servoExit.attach(PIN_SERVO_EXIT);

  // Initialize Ultrasonic pins:
  pinMode(SWITCH_ENTR, INPUT_PULLUP);
  pinMode(SWITCH_EXIT, INPUT_PULLUP);
  pinMode(PIN_TRIG_ENTR, OUTPUT);
  pinMode(PIN_ECHO_ENTR, INPUT);
  pinMode(PIN_TRIG_EXIT, OUTPUT);
  pinMode(PIN_ECHO_EXIT, INPUT);

  // Initialize WIFI connection:
  myClient_Exit.networkSetup();
  myClient_Entry.networkSetup();
}

void loop() {
  // Read the state of the switches:
  int StateEntr = digitalRead(SWITCH_ENTR);
  int StateExit = digitalRead(SWITCH_EXIT);
  
  // Check the mode of the Gate:
  // If changing from "EXIT" to "ENTRY" - connect the Entry object to the server (will disconnect the Exit object)
  // and vice versa
  if (StateEntr == LOW && StateExit == HIGH)  {// SWITCH_ENTR pin is connected to ground, SWITCH_EXIT pin unconnected
    if (!isEntr) {
      myClient_Entry.connectToServer();  
      isEntr = true; isExit = false;  // Change the mode to "ENTRY"
    }
  }
  else {
    if (!isExit) {
      myClient_Exit.connectToServer();  
      isExit = true; isEntr = false;  // Change the mode to "EXIT"
    }
  }

  // Read the ultrasonic on the active gate and send to server if an object detected:
  if (isEntr) {
    if(myClient_Entry.isConnectionSucceed()) {
      Serial.println("Acting as Entry Gate -------------------------------");
      myClient_Entry.handle();
      myClient_Entry.sendDistance("entry", THRESHOLD_GATE, PIN_TRIG_ENTR, PIN_ECHO_ENTR);
    }
    if(myClient_Entry.isOpenRequired()) {
      GateOpen(servoEntry);
    }
    if(myClient_Entry.isCloseRequired()) {
      GateClose(servoEntry);
      myClient_Entry.setCloseRequest(false);
    }
  } 
  else if (isExit) {
    if(myClient_Exit.isConnectionSucceed()) {
      Serial.println("Acting as Exit Gate -------------------------------");
      myClient_Exit.handle();
      myClient_Exit.sendDistance("exit", THRESHOLD_GATE, PIN_TRIG_EXIT, PIN_ECHO_EXIT);
    }
    if(myClient_Exit.isOpenRequired()) {
      GateOpen(servoExit);
    }
    if(myClient_Exit.isCloseRequired()) {
      GateClose(servoExit);
      myClient_Exit.setCloseRequest(false);
    }
  }
  
  delay(2000);
}

void GateOpen(Servo myServo) {
  for(int posDegrees = 0; posDegrees <= 90; posDegrees++) {
    myServo.write(posDegrees);
    delay(20);
  }
  Serial.println("GATE OPEN >>>>>>>>>>>>>>>>>>");
}

void GateClose(Servo myServo) {  
  for(int posDegrees = 90; posDegrees >= 0; posDegrees--) {
    myServo.write(posDegrees);
    delay(2000);
  }
}


