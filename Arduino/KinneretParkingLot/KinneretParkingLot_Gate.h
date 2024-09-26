#ifndef PARKINGGATE
#define PARKINGGATE

#include "KinneretParkingLot.h"

class Gate : public MyLotNode {
	
protected:
	bool 	 block_usonic = false;
	bool 	 flag_gateClose = false;
	bool 	 flag_gateOpen = false;

public:
	Gate(const IPAddress& myIP);
	virtual void checkDistance(String myString, int myThreshold, int myTrig, int myEcho);
	bool 		isCloseRequired() { return flag_gateClose; }
	bool 		isOpenRequired() { return flag_gateOpen; }
	void 		onMessageCallback(WebsocketsMessage message) override;
	uint16_t	readDistance(int myTrig, int myEcho);
	void 		setCloseRequest(bool b) { flag_gateClose = b; }
};

#endif
