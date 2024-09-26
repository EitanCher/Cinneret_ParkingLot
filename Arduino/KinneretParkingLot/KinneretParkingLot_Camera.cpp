#include "KinneretParkingLot_Camera.h"

ParkingCamera::ParkingCamera(const IPAddress& myIP) : MyLotNode(myIP) {}

void ParkingCamera::onMessageCallback(WebsocketsMessage message) {
	String msg = message.data();
	String log = "Message received: " + message.data();
	Serial.println(log);
	if (msg == "TAKE_PICTURE") {
		this->flag_takePicture = true;
	}
}

void ParkingCamera::sendPicture(const char* data, const size_t len) {
	wsClient.sendBinary(data, len);
	this->flag_takePicture = false;
}
