#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoWebsockets.h>
#include <KinneretParkingLot.h>

// === Pins Definitions: =====================================================
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

unsigned long myTimer;

// Local IPs are manually set for current devices (Ultrasonic Sensors on Entry/Exist). 
// The IPs have to be verified not to conflict with other devices.
// The IPs have to match the relevant data in the DB
IPAddress local_IP_entr(192, 168, 1, 2); 
IPAddress local_IP_exit(192, 168, 1, 3);

// === Create objects for Clients: ==========================================
MyLotNode myClient_Entry(local_IP_entr);
MyLotNode myClient_Exit(local_IP_exit);

void setup() {
  Serial.begin(9600);
  Serial.println("Starting....................");
  
  // Initialize the pins:
  pinMode(SWITCH_ENTR, INPUT_PULLUP);
  pinMode(SWITCH_EXIT, INPUT_PULLUP);
  pinMode(PIN_TRIG_ENTR, OUTPUT);
  pinMode(PIN_ECHO_ENTR, INPUT);
  pinMode(PIN_TRIG_EXIT, OUTPUT);
  pinMode(PIN_ECHO_EXIT, INPUT);

  // Initialize WIFI connection:
  myClient_Entry.networkSetup();
  myClient_Exit.networkSetup();

  // Connect to the server:
  myClient_Entry.defineWSClient();  
  myClient_Exit.defineWSClient();  

  myTimer = millis();
}

void loop() {
  // Perform rollcall for the clients:
  if (millis() - myTimer >= myClient_Entry.getInterval()) {
    myClient_Entry.rollcall();  
    myTimer = millis();  // Reset timer
  }
  if (millis() - myTimer >= myClient_Exit.getInterval()) {
    myClient_Exit.rollcall();  
    myTimer = millis();  // Reset timer
  }

  // Read the state of the switches:
  int StateEntr = digitalRead(SWITCH_ENTR);
  int StateExit = digitalRead(SWITCH_EXIT);
  bool isEntr, isExit;
  
  // Check the mode of the Gate:
  if (StateEntr == LOW && StateExit == HIGH)  // SWITCH_ENTR pin is connected to ground, SWITCH_EXIT pin unconnected
    {isEntr = true; isExit = false;}
  else   
    {isExit = true; isEntr = false;}

  // Read the ultrasonic on the active gate and send to server if an object detected:
  if (isEntr) {
    Serial.println("Acting as Entry Gate -------------------------------");
    myClient_Entry.sendDistance("entry", THRESHOLD_GATE, PIN_TRIG_ENTR, PIN_ECHO_ENTR);
  } else {
    Serial.println("Acting as Exit Gate -------------------------------");
    myClient_Exit.sendDistance("exit", THRESHOLD_GATE, PIN_TRIG_EXIT, PIN_ECHO_EXIT);
  }
  
  delay(2000);
}
