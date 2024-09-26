#ifndef PARKINGCAMERA
#define PARKINGCAMERA

#include "KinneretParkingLot.h"

class ParkingCamera : public MyLotNode {
	
private:
	bool flag_takePicture = false;

public:
	ParkingCamera(const IPAddress& myIP);
	bool 	isShotRequired() { return flag_takePicture; }
	void 	onMessageCallback(WebsocketsMessage message) override;
	void 	sendPicture(const char* data, const size_t len);
	void 	setShotRequire(bool b) { flag_takePicture = b; }
};

#endif
