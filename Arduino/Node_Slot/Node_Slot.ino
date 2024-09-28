#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoWebsockets.h>
#include <KinneretParkingLot_Slot.h>

// === Pins Definitions: =====================================================
// HC-SR04 (ultrasonic sensor) pins:
#define PIN_TRIG_SLOT 5
#define PIN_ECHO_SLOT 17
#define PIN_TRIG_LINE 19
#define PIN_ECHO_LINE 18
// LED pins:
#define PIN_LED_GRN 26
#define PIN_LED_BLU 27
#define PIN_LED_RED 32
#define PIN_LED_YEL 33
#define LED_COUNT 4

int LEDs[LED_COUNT] = {PIN_LED_GRN, PIN_LED_BLU, PIN_LED_RED, PIN_LED_YEL};

// Distance threshold in centimeters:
#define THRESHOLD_SLOT 20
#define THRESHOLD_LINE 20

// Local IPs are manually set for current devices (Ultrasonic Sensors on Entry/Exist). 
// The IPs have to be verified not to conflict with other devices.
// The IPs have to match the relevant data in the DB
IPAddress local_IP(192, 168, 110, 66); 
const char* slotID = "slot_19";

// === Create object for Client: ==========================================
Slot myClient(local_IP);

void setup() {
  Serial.begin(9600);
  Serial.println("Starting....................");

  // Initialize Ultrasonic pins:
  pinMode(PIN_TRIG_SLOT, OUTPUT);
  pinMode(PIN_ECHO_SLOT, INPUT);
  pinMode(PIN_TRIG_LINE, OUTPUT);
  pinMode(PIN_ECHO_LINE, INPUT);

  // Initialize LED pins:
  for (int i = 0; i < LED_COUNT; i++) {
    pinMode(LEDs[i], OUTPUT);
  }

  // Initialize connection to WIFI then to the server:
  myClient.networkSetup();
  myClient.connectToServer();  
}

void loop() {
  // Read the ultrasonic on the Slot and send to server if an object detected:
  if(myClient.isConnectionSucceed()) {
    myClient.handle();
    myClient.checkDistance(slotID, THRESHOLD_SLOT, PIN_TRIG_SLOT, PIN_ECHO_SLOT);
  }

  // Check which LED to toggle on:
  if(!myClient.checkFree() && !myClient.checkReserved() && !myClient.checkViolated())       {toggleLED(PIN_LED_YEL);}
  else if (myClient.checkFree() && !myClient.checkReserved() && !myClient.checkViolated())  {toggleLED(PIN_LED_GRN);}
  if(myClient.checkReserved() && !myClient.checkViolated())                                 {toggleLED(PIN_LED_BLU);}
  if(myClient.checkViolated())                                                              {toggleLED(PIN_LED_RED);}
  
  delay(2000);
}

void toggleLED(int myLed) {
  for (int i = 0; i < LED_COUNT; i++) { 
    if(LEDs[i] == myLed) { digitalWrite(LEDs[i], HIGH); }
    else { digitalWrite(LEDs[i], LOW); }  
  }
}

