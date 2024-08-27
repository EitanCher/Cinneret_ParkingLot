--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 16.3

-- Started on 2024-08-17 12:46:49 IDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 16513)
-- Name: ParkingLot_DB; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "ParkingLot_DB";


ALTER SCHEMA "ParkingLot_DB" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16542)
-- Name: Areas; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."Areas" (
    "idAreas" integer NOT NULL,
    "AreaName" character varying(45) NOT NULL
);


ALTER TABLE "ParkingLot_DB"."Areas" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16541)
-- Name: Areas_idAreas_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."Areas_idAreas_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."Areas_idAreas_seq" OWNER TO postgres;

--
-- TOC entry 3687 (class 0 OID 0)
-- Dependencies: 219
-- Name: Areas_idAreas_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."Areas_idAreas_seq" OWNED BY "ParkingLot_DB"."Areas"."idAreas";


--
-- TOC entry 226 (class 1259 OID 16572)
-- Name: Borders; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."Borders" (
    "idBorders" integer NOT NULL,
    "Violated" boolean NOT NULL
);


ALTER TABLE "ParkingLot_DB"."Borders" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16571)
-- Name: Borders_idBorders_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."Borders_idBorders_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."Borders_idBorders_seq" OWNER TO postgres;

--
-- TOC entry 3688 (class 0 OID 0)
-- Dependencies: 225
-- Name: Borders_idBorders_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."Borders_idBorders_seq" OWNED BY "ParkingLot_DB"."Borders"."idBorders";


--
-- TOC entry 218 (class 1259 OID 16528)
-- Name: Cars; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."Cars" (
    "idCars" integer NOT NULL,
    "RegistrationID" character varying(11) NOT NULL,
    "Model" character varying(45) NOT NULL,
    "OwnerID" integer NOT NULL
);


ALTER TABLE "ParkingLot_DB"."Cars" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16527)
-- Name: Cars_idCars_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."Cars_idCars_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."Cars_idCars_seq" OWNER TO postgres;

--
-- TOC entry 3689 (class 0 OID 0)
-- Dependencies: 217
-- Name: Cars_idCars_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."Cars_idCars_seq" OWNED BY "ParkingLot_DB"."Cars"."idCars";


--
-- TOC entry 222 (class 1259 OID 16551)
-- Name: Gates; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."Gates" (
    "idGates" integer NOT NULL,
    "Entrance" boolean NOT NULL,
    "AreaID" integer NOT NULL,
    "Fault" boolean NOT NULL
);


ALTER TABLE "ParkingLot_DB"."Gates" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16550)
-- Name: Gates_idGates_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."Gates_idGates_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."Gates_idGates_seq" OWNER TO postgres;

--
-- TOC entry 3690 (class 0 OID 0)
-- Dependencies: 221
-- Name: Gates_idGates_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."Gates_idGates_seq" OWNED BY "ParkingLot_DB"."Gates"."idGates";


--
-- TOC entry 216 (class 1259 OID 16523)
-- Name: HW_Alive; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."HW_Alive" (
    "Fault" boolean DEFAULT false NOT NULL
);


ALTER TABLE "ParkingLot_DB"."HW_Alive" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16616)
-- Name: ParkingLog; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."ParkingLog" (
    "idParkingLog" integer NOT NULL,
    "CarID" integer NOT NULL,
    "SlotID" integer NOT NULL,
    "Entrance" timestamp with time zone NOT NULL,
    "Exit" timestamp with time zone NOT NULL,
    "ParkingStart" timestamp with time zone NOT NULL,
    "ParkingEnd" timestamp with time zone NOT NULL,
    "SavingStart" timestamp with time zone NOT NULL,
    "SavingEnd" timestamp with time zone NOT NULL,
    "Violation" boolean NOT NULL
);


ALTER TABLE "ParkingLot_DB"."ParkingLog" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16615)
-- Name: ParkingLog_idParkingLog_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."ParkingLog_idParkingLog_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."ParkingLog_idParkingLog_seq" OWNER TO postgres;

--
-- TOC entry 3691 (class 0 OID 0)
-- Dependencies: 229
-- Name: ParkingLog_idParkingLog_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."ParkingLog_idParkingLog_seq" OWNED BY "ParkingLot_DB"."ParkingLog"."idParkingLog";


--
-- TOC entry 224 (class 1259 OID 16563)
-- Name: SlotSizes; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."SlotSizes" (
    "idSlotSizes" integer NOT NULL,
    "Size" character varying(45) NOT NULL
);


ALTER TABLE "ParkingLot_DB"."SlotSizes" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16562)
-- Name: SlotSizes_idSlotSizes_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."SlotSizes_idSlotSizes_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."SlotSizes_idSlotSizes_seq" OWNER TO postgres;

--
-- TOC entry 3692 (class 0 OID 0)
-- Dependencies: 223
-- Name: SlotSizes_idSlotSizes_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."SlotSizes_idSlotSizes_seq" OWNED BY "ParkingLot_DB"."SlotSizes"."idSlotSizes";


--
-- TOC entry 228 (class 1259 OID 16579)
-- Name: Slots; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."Slots" (
    "idSlots" integer NOT NULL,
    "Busy" boolean NOT NULL,
    "Area" integer NOT NULL,
    "SavedFor" integer NOT NULL,
    "TakenBy" integer NOT NULL,
    "BorderLeft" integer NOT NULL,
    "BorderRight" integer NOT NULL,
    "Size" integer NOT NULL,
    "Active" boolean NOT NULL,
    "Fault" boolean NOT NULL
);


ALTER TABLE "ParkingLot_DB"."Slots" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16578)
-- Name: Slots_idSlots_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."Slots_idSlots_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."Slots_idSlots_seq" OWNER TO postgres;

--
-- TOC entry 3693 (class 0 OID 0)
-- Dependencies: 227
-- Name: Slots_idSlots_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."Slots_idSlots_seq" OWNED BY "ParkingLot_DB"."Slots"."idSlots";


--
-- TOC entry 232 (class 1259 OID 24737)
-- Name: SubscriptionPlans; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."SubscriptionPlans" (
    "idSubscriptionPlans" integer NOT NULL,
    "Name" character varying(45) NOT NULL,
    "Price" numeric(10,2) NOT NULL,
    "MaxCars" integer NOT NULL,
    "Features" text[]
);


ALTER TABLE "ParkingLot_DB"."SubscriptionPlans" OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 24736)
-- Name: SubscriptionPlans_idSubscriptionPlans_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."SubscriptionPlans_idSubscriptionPlans_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."SubscriptionPlans_idSubscriptionPlans_seq" OWNER TO postgres;

--
-- TOC entry 3694 (class 0 OID 0)
-- Dependencies: 231
-- Name: SubscriptionPlans_idSubscriptionPlans_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."SubscriptionPlans_idSubscriptionPlans_seq" OWNED BY "ParkingLot_DB"."SubscriptionPlans"."idSubscriptionPlans";


--
-- TOC entry 234 (class 1259 OID 24755)
-- Name: UserSubscriptions; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."UserSubscriptions" (
    "idUserSubscriptions" integer NOT NULL,
    "UserID" integer NOT NULL,
    "SubscriptionPlanID" integer NOT NULL,
    "StartDate" date NOT NULL,
    "EndDate" date NOT NULL,
    "Status" character varying(20) NOT NULL
);


ALTER TABLE "ParkingLot_DB"."UserSubscriptions" OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24754)
-- Name: UserSubscriptions_idUserSubscriptions_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."UserSubscriptions_idUserSubscriptions_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."UserSubscriptions_idUserSubscriptions_seq" OWNER TO postgres;

--
-- TOC entry 3695 (class 0 OID 0)
-- Dependencies: 233
-- Name: UserSubscriptions_idUserSubscriptions_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."UserSubscriptions_idUserSubscriptions_seq" OWNED BY "ParkingLot_DB"."UserSubscriptions"."idUserSubscriptions";


--
-- TOC entry 215 (class 1259 OID 16515)
-- Name: Users; Type: TABLE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE TABLE "ParkingLot_DB"."Users" (
    "idUsers" integer NOT NULL,
    "persId" integer NOT NULL,
    "FirstName" character varying(40) NOT NULL,
    "LastName" character varying(45) NOT NULL,
    "Phone" character varying(20) NOT NULL,
    "Email" character varying(100) NOT NULL,
    "Password" character varying(255) DEFAULT NULL::character varying NOT NULL
);


ALTER TABLE "ParkingLot_DB"."Users" OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16514)
-- Name: Users_idUsers_seq; Type: SEQUENCE; Schema: ParkingLot_DB; Owner: postgres
--

CREATE SEQUENCE "ParkingLot_DB"."Users_idUsers_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ParkingLot_DB"."Users_idUsers_seq" OWNER TO postgres;

--
-- TOC entry 3696 (class 0 OID 0)
-- Dependencies: 214
-- Name: Users_idUsers_seq; Type: SEQUENCE OWNED BY; Schema: ParkingLot_DB; Owner: postgres
--

ALTER SEQUENCE "ParkingLot_DB"."Users_idUsers_seq" OWNED BY "ParkingLot_DB"."Users"."idUsers";


--
-- TOC entry 3492 (class 2604 OID 16545)
-- Name: Areas idAreas; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Areas" ALTER COLUMN "idAreas" SET DEFAULT nextval('"ParkingLot_DB"."Areas_idAreas_seq"'::regclass);


--
-- TOC entry 3495 (class 2604 OID 16575)
-- Name: Borders idBorders; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Borders" ALTER COLUMN "idBorders" SET DEFAULT nextval('"ParkingLot_DB"."Borders_idBorders_seq"'::regclass);


--
-- TOC entry 3491 (class 2604 OID 16531)
-- Name: Cars idCars; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Cars" ALTER COLUMN "idCars" SET DEFAULT nextval('"ParkingLot_DB"."Cars_idCars_seq"'::regclass);


--
-- TOC entry 3493 (class 2604 OID 16554)
-- Name: Gates idGates; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Gates" ALTER COLUMN "idGates" SET DEFAULT nextval('"ParkingLot_DB"."Gates_idGates_seq"'::regclass);


--
-- TOC entry 3497 (class 2604 OID 16619)
-- Name: ParkingLog idParkingLog; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."ParkingLog" ALTER COLUMN "idParkingLog" SET DEFAULT nextval('"ParkingLot_DB"."ParkingLog_idParkingLog_seq"'::regclass);


--
-- TOC entry 3494 (class 2604 OID 16566)
-- Name: SlotSizes idSlotSizes; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."SlotSizes" ALTER COLUMN "idSlotSizes" SET DEFAULT nextval('"ParkingLot_DB"."SlotSizes_idSlotSizes_seq"'::regclass);


--
-- TOC entry 3496 (class 2604 OID 16582)
-- Name: Slots idSlots; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Slots" ALTER COLUMN "idSlots" SET DEFAULT nextval('"ParkingLot_DB"."Slots_idSlots_seq"'::regclass);


--
-- TOC entry 3498 (class 2604 OID 24740)
-- Name: SubscriptionPlans idSubscriptionPlans; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."SubscriptionPlans" ALTER COLUMN "idSubscriptionPlans" SET DEFAULT nextval('"ParkingLot_DB"."SubscriptionPlans_idSubscriptionPlans_seq"'::regclass);


--
-- TOC entry 3499 (class 2604 OID 24758)
-- Name: UserSubscriptions idUserSubscriptions; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."UserSubscriptions" ALTER COLUMN "idUserSubscriptions" SET DEFAULT nextval('"ParkingLot_DB"."UserSubscriptions_idUserSubscriptions_seq"'::regclass);


--
-- TOC entry 3488 (class 2604 OID 16518)
-- Name: Users idUsers; Type: DEFAULT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Users" ALTER COLUMN "idUsers" SET DEFAULT nextval('"ParkingLot_DB"."Users_idUsers_seq"'::regclass);


--
-- TOC entry 3507 (class 2606 OID 16549)
-- Name: Areas Areas_AreaName_key; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Areas"
    ADD CONSTRAINT "Areas_AreaName_key" UNIQUE ("AreaName");


--
-- TOC entry 3509 (class 2606 OID 16547)
-- Name: Areas Areas_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Areas"
    ADD CONSTRAINT "Areas_pkey" PRIMARY KEY ("idAreas");


--
-- TOC entry 3517 (class 2606 OID 16577)
-- Name: Borders Borders_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Borders"
    ADD CONSTRAINT "Borders_pkey" PRIMARY KEY ("idBorders");


--
-- TOC entry 3503 (class 2606 OID 16535)
-- Name: Cars Cars_RegistrationID_key; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Cars"
    ADD CONSTRAINT "Cars_RegistrationID_key" UNIQUE ("RegistrationID");


--
-- TOC entry 3505 (class 2606 OID 16533)
-- Name: Cars Cars_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Cars"
    ADD CONSTRAINT "Cars_pkey" PRIMARY KEY ("idCars");


--
-- TOC entry 3511 (class 2606 OID 16556)
-- Name: Gates Gates_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Gates"
    ADD CONSTRAINT "Gates_pkey" PRIMARY KEY ("idGates");


--
-- TOC entry 3521 (class 2606 OID 16621)
-- Name: ParkingLog ParkingLog_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."ParkingLog"
    ADD CONSTRAINT "ParkingLog_pkey" PRIMARY KEY ("idParkingLog");


--
-- TOC entry 3513 (class 2606 OID 16570)
-- Name: SlotSizes SlotSizes_Size_key; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."SlotSizes"
    ADD CONSTRAINT "SlotSizes_Size_key" UNIQUE ("Size");


--
-- TOC entry 3515 (class 2606 OID 16568)
-- Name: SlotSizes SlotSizes_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."SlotSizes"
    ADD CONSTRAINT "SlotSizes_pkey" PRIMARY KEY ("idSlotSizes");


--
-- TOC entry 3519 (class 2606 OID 16584)
-- Name: Slots Slots_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Slots"
    ADD CONSTRAINT "Slots_pkey" PRIMARY KEY ("idSlots");


--
-- TOC entry 3523 (class 2606 OID 24746)
-- Name: SubscriptionPlans SubscriptionPlans_Name_key; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."SubscriptionPlans"
    ADD CONSTRAINT "SubscriptionPlans_Name_key" UNIQUE ("Name");


--
-- TOC entry 3525 (class 2606 OID 24744)
-- Name: SubscriptionPlans SubscriptionPlans_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."SubscriptionPlans"
    ADD CONSTRAINT "SubscriptionPlans_pkey" PRIMARY KEY ("idSubscriptionPlans");


--
-- TOC entry 3527 (class 2606 OID 24760)
-- Name: UserSubscriptions UserSubscriptions_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."UserSubscriptions"
    ADD CONSTRAINT "UserSubscriptions_pkey" PRIMARY KEY ("idUserSubscriptions");


--
-- TOC entry 3501 (class 2606 OID 16520)
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("idUsers");


--
-- TOC entry 3528 (class 2606 OID 16536)
-- Name: Cars Cars_OwnerID_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Cars"
    ADD CONSTRAINT "Cars_OwnerID_fkey" FOREIGN KEY ("OwnerID") REFERENCES "ParkingLot_DB"."Users"("idUsers");


--
-- TOC entry 3529 (class 2606 OID 16557)
-- Name: Gates Gates_AreaID_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Gates"
    ADD CONSTRAINT "Gates_AreaID_fkey" FOREIGN KEY ("AreaID") REFERENCES "ParkingLot_DB"."Areas"("idAreas") ON DELETE CASCADE;


--
-- TOC entry 3536 (class 2606 OID 16622)
-- Name: ParkingLog ParkingLog_CarID_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."ParkingLog"
    ADD CONSTRAINT "ParkingLog_CarID_fkey" FOREIGN KEY ("CarID") REFERENCES "ParkingLot_DB"."Cars"("idCars");


--
-- TOC entry 3537 (class 2606 OID 16627)
-- Name: ParkingLog ParkingLog_SlotID_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."ParkingLog"
    ADD CONSTRAINT "ParkingLog_SlotID_fkey" FOREIGN KEY ("SlotID") REFERENCES "ParkingLot_DB"."Slots"("idSlots");


--
-- TOC entry 3530 (class 2606 OID 16585)
-- Name: Slots Slots_Area_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Slots"
    ADD CONSTRAINT "Slots_Area_fkey" FOREIGN KEY ("Area") REFERENCES "ParkingLot_DB"."Areas"("idAreas");


--
-- TOC entry 3531 (class 2606 OID 16600)
-- Name: Slots Slots_BorderLeft_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Slots"
    ADD CONSTRAINT "Slots_BorderLeft_fkey" FOREIGN KEY ("BorderLeft") REFERENCES "ParkingLot_DB"."Borders"("idBorders");


--
-- TOC entry 3532 (class 2606 OID 16605)
-- Name: Slots Slots_BorderRight_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Slots"
    ADD CONSTRAINT "Slots_BorderRight_fkey" FOREIGN KEY ("BorderRight") REFERENCES "ParkingLot_DB"."Borders"("idBorders");


--
-- TOC entry 3533 (class 2606 OID 16590)
-- Name: Slots Slots_SavedFor_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Slots"
    ADD CONSTRAINT "Slots_SavedFor_fkey" FOREIGN KEY ("SavedFor") REFERENCES "ParkingLot_DB"."Cars"("idCars");


--
-- TOC entry 3534 (class 2606 OID 16610)
-- Name: Slots Slots_Size_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Slots"
    ADD CONSTRAINT "Slots_Size_fkey" FOREIGN KEY ("Size") REFERENCES "ParkingLot_DB"."SlotSizes"("idSlotSizes");


--
-- TOC entry 3535 (class 2606 OID 16595)
-- Name: Slots Slots_TakenBy_fkey; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."Slots"
    ADD CONSTRAINT "Slots_TakenBy_fkey" FOREIGN KEY ("TakenBy") REFERENCES "ParkingLot_DB"."Cars"("idCars");


--
-- TOC entry 3538 (class 2606 OID 24772)
-- Name: UserSubscriptions SubscriptionPlan_fk; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."UserSubscriptions"
    ADD CONSTRAINT "SubscriptionPlan_fk" FOREIGN KEY ("SubscriptionPlanID") REFERENCES "ParkingLot_DB"."SubscriptionPlans"("idSubscriptionPlans");


--
-- TOC entry 3539 (class 2606 OID 24761)
-- Name: UserSubscriptions User_fk; Type: FK CONSTRAINT; Schema: ParkingLot_DB; Owner: postgres
--

ALTER TABLE ONLY "ParkingLot_DB"."UserSubscriptions"
    ADD CONSTRAINT "User_fk" FOREIGN KEY ("UserID") REFERENCES "ParkingLot_DB"."Users"("idUsers") ON DELETE CASCADE;


-- Completed on 2024-08-17 12:46:49 IDT

--
-- PostgreSQL database dump complete
--


-- need to add taken by to slots. 
--need to program that fault will switch active to false
--need to add trigger for num parking slots