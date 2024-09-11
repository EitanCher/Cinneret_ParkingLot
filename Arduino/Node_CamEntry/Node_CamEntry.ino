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
  myCameraClient.connectToServer();  

  doFlash();

  myTimer = millis();
}

void loop() {
  myCameraClient.handle();

  if (myCameraClient.isShotRequired()) {
    Serial.println("PICTURE REQUEST DETECTED ====================");
    serveJpg();
  }
}

// Capture and send an image:
void serveJpg() {
  doFlash();
  auto frame = esp32cam::capture();
  if (!frame) {
    Serial.println("CAPTURE FAILED");
    return;
  }
  
  Serial.printf("CAPTURE OK %dx%d %db\n", frame->getWidth(), frame->getHeight(), static_cast<int>(frame->size()));
  myCameraClient.sendPicture((const char*)frame->data(), frame->size());   
}

void doFlash(){
  digitalWrite(PIN_FLASH, HIGH); //Turn on
  delay (1000);
  digitalWrite(PIN_FLASH, LOW); //Turn off
  delay (500);
}

