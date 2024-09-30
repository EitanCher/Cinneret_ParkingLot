#ifndef PARKINGGATE
#define PARKINGGATE

#include "KinneretParkingLot_Sensor.h"

class ParkingGate : public ParkingSensor {
	
private:
	bool flag_gateClose = false;
	bool flag_gateOpen = false;

public:
	ParkingGate(const IPAddress& myIP);
	void checkDistance(String myString, int myThreshold, int myTrig, int myEcho) override;
	bool isCloseRequired() { return flag_gateClose; }
	bool isOpenRequired() { return flag_gateOpen; }
	void onMessageCallback(WebsocketsMessage message) override;
	void setCloseRequest(bool b) { flag_gateClose = b; }
};

#endif