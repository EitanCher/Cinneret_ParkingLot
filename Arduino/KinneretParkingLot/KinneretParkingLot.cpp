#include "KinneretParkingLot.h"

MyLotNode::MyLotNode(const IPAddress& myIP) 
	: local_IP(myIP) {
		timer = millis();
		defineWSClient();
	}
    // Syntax memo:
	// the constructor accepts an IPAddress object by reference, which avoids copying the object. 
	// ': local_IP(myIP)' is a member initializer list, used to initialize member variables of a class before the constructor body runs


void MyLotNode::handle() { 
	wsClient.poll(); 
	// Perform rollcall:
	if (millis() - this->timer >= this->rollcallInterval) {
		this->rollcall();  
		this->timer = millis();
	}
}

void MyLotNode::networkSetup() {
	Serial.println("WIFI Setup started");
	this->isConnectionSuccess = true;
	this->connectionStartTime = millis();

	// Configure static IP for the current Sensor Node:
	if (!WiFi.config(local_IP, this->gateway, this->subnet)) Serial.println("STA Failed to configure");

	wifiMulti.addAP(this->SSID, this->PSWD); // Preferred over 'WiFi.begin(this->SSID, this->PSWD)' due to support for using static IP 

	while(wifiMulti.run() != WL_CONNECTED) {
		// Apply timeout check:
		if (millis() - this->connectionStartTime >= this->connectionTimeout) {
			Serial.println("Failed to connect to WiFi within the timeout period.");
			this->isConnectionSuccess = false;
			break;
		}

		Serial.println("Attempting to connect to network...");
		delay(100);
	}
	
	if (this->isConnectionSuccess) {
		Serial.println("Connected to network");
		Serial.print("Local AP IP: ");
		Serial.println(WiFi.localIP());
	}
}

void MyLotNode::connectToServer() {
	if(!this->isConnectionSuccess) return;
	this->connectionStartTime = millis();

	while(!wsClient.connect(this->websocket_server, this->websocket_port, "/")) {
		// Apply timeout check:
		if (millis() - this->connectionStartTime >= this->connectionTimeout) {
			Serial.println("Failed to connect to Server within the timeout period.");
			this->isConnectionSuccess = false;
			break;
		}

		delay(100);
		Serial.println(this->websocket_port);
		Serial.println(this->websocket_server);
		Serial.println("Attempting to connect to websocket server ....");
	}
}

void MyLotNode::defineWSClient() {
	wsClient.onMessage([this](WebsocketsMessage message){
		this->onMessageCallback(message);
	});

	wsClient.onEvent([this](WebsocketsEvent event, String data) {
		if (event == WebsocketsEvent::ConnectionOpened) {
			Serial.print("Websocket server connected for client: ");
			Serial.println(this->local_IP);
		} else if (event == WebsocketsEvent::ConnectionClosed) {
			Serial.print("Websocket server disconnected for client: ");
			Serial.println(this->local_IP);
			this->connectToServer();
		} else if (event == WebsocketsEvent::GotPing) {
			Serial.println("Ping received");
		}
	});
}

void MyLotNode::onMessageCallback(WebsocketsMessage message){
	String msg = message.data();
	String log = "Message received: " + message.data();
	Serial.println(log);
	if (msg == "TAKE_PICTURE") {
		this->flag_takePicture = true;
	}
	if (msg == "PREPARE_ANOTHER_SHOT") {
		this->flag_gateOpen = false;
		this->block_usonic = false;
	}
	if (msg == "OPEN_GATE") {
		this->flag_gateOpen = true;
		this->block_usonic = false;
	}
}

void MyLotNode::rollcall() {
	if(wsClient.available()) {
		String msg = this->local_IP.toString() + " ACTIVE"; 
		wsClient.send(msg);
	}
	else 
		this->connectToServer();
}

void MyLotNode::readDistance(int myTrig, int myEcho) {
  uint16_t duration;

  // Trigger the HC-SR04 to send an ultrasonic pulse:
  digitalWrite(myTrig, LOW);
  delayMicroseconds(2);
  digitalWrite(myTrig, HIGH);
  delayMicroseconds(10);
  digitalWrite(myTrig, LOW);

  // Read the echo time:
  duration = pulseIn(myEcho, HIGH); //Returns the length of the pulse in microseconds or 0 if no complete pulse was received within the timeout

  // Calculate the distance in centimeters
  this->distance = duration * 0.034 / 2;	// Sound speed is about 34mps
  Serial.print("Distance: ");
  Serial.print(this->distance);
  Serial.println(" cm");
}

void MyLotNode::sendDistance(String myString, int myThreshold, int myTrig, int myEcho) {  
	if (!this->block_usonic) {
		this->readDistance(myTrig, myEcho);
  
		if (this->distance > 0 && this->distance < myThreshold) {
			Serial.print("Object detected on ");
			Serial.println(myString);
			if (!this->flag_gateOpen) {
				wsClient.send("OBJECT_DETECTED");	// Trigger the camera
				this->block_usonic = true;	// Stop measuring proximity
			}
		}
		else if (this->distance == 0) {
			if (!this->flag_gateOpen) {
				wsClient.send("0_DISTANCE");
			}
		}
		else {	// No object detected by the sensor
			if (this->flag_gateOpen) {	// If Gate is open, close it:
				this->flag_gateOpen = false;
				this->flag_gateClose = true;
			}
		}
	}
	else Serial.println("Proximity measurement blocked");
}

void MyLotNode::sendPicture(const char* data, const size_t len) {
	wsClient.sendBinary(data, len);
	this->flag_takePicture = false;
}


