#include "KinneretParkingLot_Camera.h"

Camera::Camera(const IPAddress& myIP) : MyLotNode(myIP) {}

void Camera::onMessageCallback(WebsocketsMessage message) {
	String msg = message.data();
	String log = "Message received: " + message.data();
	Serial.println(log);
	if (msg == "TAKE_PICTURE") {
		this->flag_takePicture = true;
	}
}

void Camera::sendPicture(const char* data, const size_t len) {
	wsClient.sendBinary(data, len);
	this->flag_takePicture = false;
}
