#ifndef PARKINGSLOT
#define PARKINGSLOT

#include "KinneretParkingLot_Sensor.h"

class ParkingSlot : public ParkingSensor {

private:
	const uint32_t 	limitAttemptDuration = 5000; // Set duration for parking attempt to 1 minute
	const uint16_t	limitAttempts = 3;
	uint16_t		cntAttempts = 0;
	unsigned long 	parkingTimer = 0;
	unsigned long 	timerStart = 0;
	bool 			parkStages[3];
	bool			isReserved = false;
	bool			isFree = true;
	bool			isViolated = false;

public:
	ParkingSlot(const IPAddress& myIP);
	void checkDistance(String myString, int myThreshold, int myTrig, int myEcho) override;
	bool checkFree() 	{return isFree;}
	bool checkReserved() {return isReserved;}
	bool checkViolated() {return isViolated;}
	void onMessageCallback(WebsocketsMessage message) override;
	void updateStage(int myStage);
};

#endif