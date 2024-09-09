#include <esp32cam.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoWebsockets.h>
#include <KinneretParkingLot.h>

// Local IP is manually set for current device (Camera on Entry). 
// The IP has to be verified not to conflict with other devices.
// The IP has to match the relevant data in the DB
IPAddress local_IP(192, 168, 1, 4);

#define PIN_FLASH 4
unsigned long myTimer;
static auto loRes = esp32cam::Resolution::find(320, 240);
static auto midRes = esp32cam::Resolution::find(350, 530);
static auto hiRes = esp32cam::Resolution::find(800, 600);


// === Create objects for Clients: ==========================================
MyLotNode myCameraClient(local_IP);

void setup() {
  Serial.begin(9600);
  delay(1000);
  Serial.println("\n\nStarting....................");
  pinMode(PIN_FLASH, OUTPUT); //Support flash

  //Set up the camera:
  {
    using namespace esp32cam;
    Config cfg;
    cfg.setPins(pins::AiThinker);
    cfg.setResolution(hiRes);
    cfg.setBufferCount(2);
    cfg.setJpeg(80);
 
    bool camOk = Camera.begin(cfg);
    Serial.println(camOk ? "CAMERA SETUP OK" : "CAMERA SETUP FAILED");
  }
  
  // Connect to WIFI:
  myCameraClient.networkSetup();

  // Connect to the server:
  myCameraClient.defineWSClient();  

  doFlash();

  myTimer = millis();
}

void loop() {
  myCameraClient.handle();
  
  // Perform rollcall:
  if (millis() - myTimer >= myCameraClient.getInterval()) {
    myCameraClient.rollcall();  
    myTimer = millis();
  }

  if (myCameraClient.isShotRequired()) {
    Serial.println("PICTURE REQUEST DETECTED ====================");
    doFlash();
    myCameraClient.setShotRequire(false);
  }
}

// Capture and send an image:
void serveJpg() {
  auto frame = esp32cam::capture();
  if (frame == nullptr) {
    Serial.println("CAPTURE FAIL");
    return;
  }
  
  Serial.printf("CAPTURE OK %dx%d %db\n", frame->getWidth(), frame->getHeight(), static_cast<int>(frame->size()));
  /*
  //When message "TAKE_PICTURE" received, start writing the incoming binary data to a file until it receives "END_OF_JPEG".
  String startOfFile = "START_OF_JPEG";
  String endOfFile = "END_OF_JPEG";
  webSocket.sendTXT(startOfFile);
  webSocket.sendBIN(frame->data(), frame->size());
  webSocket.sendTXT(endOfFile);
  */
}

void doFlash(){
  digitalWrite(PIN_FLASH, HIGH); //Turn on
  delay (1000);
  digitalWrite(PIN_FLASH, LOW); //Turn off
  delay (500);
}

