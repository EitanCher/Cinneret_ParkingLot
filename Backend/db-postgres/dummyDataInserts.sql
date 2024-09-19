INSERT INTO "Areas" ("AreaName", "CityID")
VALUES 
('Area 1', 1),
('Area 2', 2),
('Area 3', 3),
('Area 4', 4);


INSERT INTO "Slots" ("Busy", "BorderRight", "Active", "Fault", "AreaID", "CameraIP", "SlotIP")
VALUES 
(false, 3, true, false, 1, '192.168.1.101', '192.168.1.201'),
(true, 5, false, true, 1, '192.168.1.102', '192.168.1.202'),
(false, 8, true, false, 2, '192.168.1.103', '192.168.1.203');


INSERT INTO "Gates" ("Entrance", "Fault", "CityID", "CameraIP", "GateIP")
VALUES 
(true, false, 1, '192.168.2.101', '192.168.2.201'),  -- Gate 1 in City 1
(false, true, 1, '192.168.2.102', '192.168.2.202'),  -- Gate 2 in City 1
(true, false, 2, '192.168.2.103', '192.168.2.203'),  -- Gate 1 in City 2
(false, true, 3, '192.168.2.104', '192.168.2.204'), -- Gate 1 in City 3
(true, false, 4, '192.168.2.105', '192.168.2.205');  -- Gate 1 in City 4
