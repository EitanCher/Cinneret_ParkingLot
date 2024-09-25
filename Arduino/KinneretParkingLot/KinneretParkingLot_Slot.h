#ifndef PARKINGSLOT
#define PARKINGSLOT

#include "KinneretParkingLot_Gate.h"

class Slot : public Gate {

private:
	const uint32_t 	durationInit = 300000; // Set initial duration to 5 minutes
	unsigned long 	parkingTimer = 0;
	unsigned long 	timerStart = 0;

public:
	Slot(const IPAddress& myIP);
	void 	checkDistance(String myString, int myThreshold, int myTrig, int myEcho) override;
	void 	onMessageCallback(WebsocketsMessage message) override;
};

#endif
