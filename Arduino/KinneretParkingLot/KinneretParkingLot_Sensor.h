#ifndef PARKINGSENSOR
#define PARKINGSENSOR

#include "KinneretParkingLot.h"

class ParkingSensor : public MyLotNode {
	
protected:
	bool block_usonic = false;

public:
	ParkingSensor(const IPAddress& myIP);
	virtual void checkDistance(String myString, int myThreshold, int myTrig, int myEcho) = 0;
	uint16_t readDistance(int myTrig, int myEcho);
};

#endif