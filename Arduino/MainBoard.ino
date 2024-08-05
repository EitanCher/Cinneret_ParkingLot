#include <WiFi.h>
#include <WebServer.h>

//const char* WIFI_SSID = "Kinneret Colledge";
//const char* WIFI_PASS = "";
const char* WIFI_SSID = "inanforever";
const char* WIFI_PASS = "0509232623";

// Local IP address and port
//const char* localWIFI_ip = "";
const int serverPort = 80;

// HC-SR04 (ultrasonic sensor) pins
#define TRIG_PIN 19
#define ECHO_PIN 18

// Distance threshold in centimeters
#define DISTANCE_THRESHOLD 20

WiFiServer server(80);

void setup() {
  Serial.begin(9600);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  IPAddress localWIFI_ip = WiFi.localIP(); // "IPAddress" is an object (datatype)

  // Print the IP address
  Serial.print("Local IP: ");
  Serial.println(localWIFI_ip);
  
  // Initialize the HC-SR04 sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // Start the server
  server.begin();
  Serial.println("Server started");

}

void loop() {
  long duration, distance;

  // Trigger the HC-SR04 to send an ultrasonic pulse:
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read the echo time
  duration = pulseIn(ECHO_PIN, HIGH); //Returns the length of the pulse in microseconds or 0 if no complete pulse was received within the timeout

  // Calculate the distance in centimeters
  distance = duration * 0.034 / 2;	// Sound speed is about 34 mps
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Check if the distance is below the threshold
  if (distance < DISTANCE_THRESHOLD) {
    // Wait for a client to connect
    WiFiClient client = server.available();
    if (client) {
      Serial.println("Client connected");

      // Send notification to the client
      client.println("Object detected");
      
      // Close the connection
      client.stop();
      Serial.println("Client disconnected");
    }
  }

  // Wait before the next loop iteration
  delay(1000);
}
