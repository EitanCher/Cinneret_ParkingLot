#include <WiFi.h>
#include <esp32cam.h>
#include <WebSocketsClient.h>

//const char* WIFI_SSID = "Kinneret Colledge";
//const char* WIFI_PASS = "";
//const char* WIFI_SSID = "inanforever";
//const char* WIFI_PASS = "0509232623";
const char* WIFI_SSID = "myWIFI";
const char* WIFI_PASS = "12345678";

IPAddress local_IP(192, 168, 1, 254); // Manually set for current device (Camera Node Board). Has to be verified not to conflict with other devices.
IPAddress gateway(192, 168, 1, 1);    // Router's IP address (has to be verified for each network but certain conventions are common)
IPAddress subnet(255, 255, 255, 0);   // Subnet mask for the local network

const char* server_IP = "192.168.4.1";
//const char* server_IP = "192.168.0.123";
WebSocketsClient webSocket;

static auto loRes = esp32cam::Resolution::find(320, 240);
static auto midRes = esp32cam::Resolution::find(350, 530);
static auto hiRes = esp32cam::Resolution::find(800, 600);

// Capture and send an image:
void serveJpg() {
  auto frame = esp32cam::capture();
  if (frame == nullptr) {
    Serial.println("CAPTURE FAIL");
    return;
  }
  
  Serial.printf("CAPTURE OK %dx%d %db\n", frame->getWidth(), frame->getHeight(), static_cast<int>(frame->size()));
  
  //When server receives "START_OF_JPEG", it should start writing the incoming binary data to a file until it receives "END_OF_JPEG".
  String startOfFile = "START_OF_JPEG";
  String endOfFile = "END_OF_JPEG";
  webSocket.sendTXT(startOfFile);
  webSocket.sendBIN(frame->data(), frame->size());
  webSocket.sendTXT(endOfFile);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("Disconnected from WebSocket server");
      delay(500); 
		  break;
    case WStype_CONNECTED:
      Serial.println("Connected to WebSocket server");
      delay(500); 
      break;
    case WStype_TEXT:
      Serial.printf("Received text: %s\n", payload);
      if (strcmp((char *)payload, "TRIGGER_ENTRANCE") == 0) {
        // Activate the flash:
        doFlash();

        // Capture an image
        serveJpg();
      }
      delay(500); 
      break;
  }
}

void setup() {
  Serial.begin(9600);

  //Set up the camera:
  {
    using namespace esp32cam;
    Config cfg;
    cfg.setPins(pins::AiThinker);
    cfg.setResolution(hiRes);
    cfg.setBufferCount(2);
    cfg.setJpeg(80);
 
    bool camOk = Camera.begin(cfg);
    Serial.println(camOk ? "CAMERA OK" : "CAMERA FAIL");
  }
  pinMode(4, OUTPUT);

  // Configure static IP for this Camera-Node:
  if (!WiFi.config(local_IP, gateway, subnet)) {
    Serial.println("STA Failed to configure");
  }

  connectWIFI();

  // Initialize WebSocket client
  //webSocket.begin("192.168.1.1", 81);
  webSocket.begin(server_IP, 81);
  webSocket.onEvent(webSocketEvent);
  webSocket.connect();

  //Avoid overwhelming the server with too many reconnection attempts in a short period if the network is unstable:
  //webSocket.setReconnectInterval(1000);
}

void loop() {
  // Handle WebSocket communication:
  webSocket.loop();

  //delay(500); 
}

void connectWIFI() {
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  //WiFi.begin(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting  to WiFi...");
  }
  Serial.println("Connected to WiFi");

  Serial.print("Local IP: ");
  Serial.println(WiFi.localIP());
}

void doFlash(){
  digitalWrite(4, LOW); //Turn on
  delay (500);
  digitalWrite(4, HIGH); //Turn off
  delay (4000);
}
