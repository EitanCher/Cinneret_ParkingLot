
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



CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;


CREATE FUNCTION public.notify_slot_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
        BEGIN
          PERFORM pg_notify('slot_change', json_build_object(
            'area_id', NEW."AreaID",
            'is_busy', NEW."Busy"
          )::text);
          RETURN NEW;
        END;
        $$;


ALTER FUNCTION public.notify_slot_change() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;



CREATE TABLE public."Areas" (
    "idAreas" integer NOT NULL,
    "AreaName" character varying(45) NOT NULL,
    "CityID" integer NOT NULL
);


ALTER TABLE public."Areas" OWNER TO postgres;


CREATE SEQUENCE public."Areas_idAreas_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Areas_idAreas_seq" OWNER TO postgres;



ALTER SEQUENCE public."Areas_idAreas_seq" OWNED BY public."Areas"."idAreas";




CREATE TABLE public."Cars" (
    "idCars" integer NOT NULL,
    "RegistrationID" character varying(11) NOT NULL,
    "Model" character varying(45) NOT NULL,
    "OwnerID" integer NOT NULL
);


ALTER TABLE public."Cars" OWNER TO postgres;

CREATE SEQUENCE public."Cars_idCars_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Cars_idCars_seq" OWNER TO postgres;


ALTER SEQUENCE public."Cars_idCars_seq" OWNED BY public."Cars"."idCars";

CREATE TABLE public."Cities" (
    "idCities" integer NOT NULL,
    "CityName" character varying(45) NOT NULL,
    "FullAddress" character varying(255) NOT NULL
);


ALTER TABLE public."Cities" OWNER TO postgres;

CREATE SEQUENCE public."Cities_idCities_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Cities_idCities_seq" OWNER TO postgres;

ALTER SEQUENCE public."Cities_idCities_seq" OWNED BY public."Cities"."idCities";



CREATE TABLE public."Gates" (
    "idGates" integer NOT NULL,
    "Entrance" boolean NOT NULL,
    "Fault" boolean NOT NULL,
    "CityID" integer NOT NULL,
    "CameraIP" character varying(15) NOT NULL,
    "GateIP" character varying(15) NOT NULL
);


ALTER TABLE public."Gates" OWNER TO postgres;


CREATE SEQUENCE public."Gates_idGates_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Gates_idGates_seq" OWNER TO postgres;


ALTER SEQUENCE public."Gates_idGates_seq" OWNED BY public."Gates"."idGates";



CREATE TABLE public."ParkingLog" (
    "idParkingLog" integer NOT NULL,
    "CarID" integer NOT NULL,
    "SlotID" integer NOT NULL,
    "Entrance" timestamp(6) with time zone NOT NULL,
    "Exit" timestamp(6) with time zone NOT NULL,
    "Violation" boolean NOT NULL,
    "ReservationID" integer,
    "NeedToExitBy" timestamp(6) with time zone NOT NULL
);


ALTER TABLE public."ParkingLog" OWNER TO postgres;



CREATE SEQUENCE public."ParkingLog_idParkingLog_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ParkingLog_idParkingLog_seq" OWNER TO postgres;



ALTER SEQUENCE public."ParkingLog_idParkingLog_seq" OWNED BY public."ParkingLog"."idParkingLog";




CREATE TABLE public."Reservations" (
    "idReservation" integer NOT NULL,
    "UserID" integer NOT NULL,
    "CarID" integer NOT NULL,
    "SlotID" integer NOT NULL,
    "ReservationStart" timestamp(6) with time zone NOT NULL,
    "ReservationEnd" timestamp(6) with time zone NOT NULL,
    "Status" character varying(20) DEFAULT 'pending'::character varying NOT NULL
);


ALTER TABLE public."Reservations" OWNER TO postgres;


CREATE SEQUENCE public."Reservations_idReservation_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Reservations_idReservation_seq" OWNER TO postgres;

ALTER SEQUENCE public."Reservations_idReservation_seq" OWNED BY public."Reservations"."idReservation";


CREATE TABLE public."Slots" (
    "idSlots" integer NOT NULL,
    "Busy" boolean DEFAULT false,
    "BorderRight" integer NOT NULL,
    "Active" boolean DEFAULT true,
    "Fault" boolean DEFAULT false,
    "AreaID" integer NOT NULL,
    "CameraIP" character varying(15) NOT NULL,
    "SlotIP" character varying(15) NOT NULL
);


ALTER TABLE public."Slots" OWNER TO postgres;


CREATE SEQUENCE public."Slots_idSlots_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Slots_idSlots_seq" OWNER TO postgres;



ALTER SEQUENCE public."Slots_idSlots_seq" OWNED BY public."Slots"."idSlots";


CREATE TABLE public."SubscriptionPlans" (
    "idSubscriptionPlans" integer NOT NULL,
    "Name" character varying(45) NOT NULL,
    "Price" numeric(10,2) NOT NULL,
    "MaxCars" integer NOT NULL,
    "Features" text[],
    "MaxActiveReservations" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."SubscriptionPlans" OWNER TO postgres;


CREATE SEQUENCE public."SubscriptionPlans_idSubscriptionPlans_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SubscriptionPlans_idSubscriptionPlans_seq" OWNER TO postgres;



ALTER SEQUENCE public."SubscriptionPlans_idSubscriptionPlans_seq" OWNED BY public."SubscriptionPlans"."idSubscriptionPlans";


CREATE TABLE public."UserSubscriptions" (
    "idUserSubscriptions" integer NOT NULL,
    "UserID" integer NOT NULL,
    "SubscriptionPlanID" integer NOT NULL,
    "StartDate" date NOT NULL,
    "EndDate" date NOT NULL,
    "Status" character varying(20) NOT NULL,
    "StripeSessionId" character varying(255)
);


ALTER TABLE public."UserSubscriptions" OWNER TO postgres;


CREATE SEQUENCE public."UserSubscriptions_idUserSubscriptions_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserSubscriptions_idUserSubscriptions_seq" OWNER TO postgres;


ALTER SEQUENCE public."UserSubscriptions_idUserSubscriptions_seq" OWNED BY public."UserSubscriptions"."idUserSubscriptions";


CREATE TABLE public."Users" (
    "idUsers" integer NOT NULL,
    "persId" character varying(9) NOT NULL,
    "FirstName" character varying(40) NOT NULL,
    "LastName" character varying(45) NOT NULL,
    "Phone" character varying(20) NOT NULL,
    "Email" character varying(100) NOT NULL,
    "Password" character varying(255) NOT NULL,
    violations integer DEFAULT 0 NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying NOT NULL
);


ALTER TABLE public."Users" OWNER TO postgres;



CREATE SEQUENCE public."Users_idUsers_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_idUsers_seq" OWNER TO postgres;


ALTER SEQUENCE public."Users_idUsers_seq" OWNED BY public."Users"."idUsers";

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;



CREATE TABLE public.test_table (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.test_table OWNER TO postgres;

CREATE SEQUENCE public.test_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_table_id_seq OWNER TO postgres;

ALTER SEQUENCE public.test_table_id_seq OWNED BY public.test_table.id;

ALTER TABLE ONLY public."Areas" ALTER COLUMN "idAreas" SET DEFAULT nextval('public."Areas_idAreas_seq"'::regclass);

ALTER TABLE ONLY public."Cars" ALTER COLUMN "idCars" SET DEFAULT nextval('public."Cars_idCars_seq"'::regclass);

ALTER TABLE ONLY public."Cities" ALTER COLUMN "idCities" SET DEFAULT nextval('public."Cities_idCities_seq"'::regclass);


ALTER TABLE ONLY public."Gates" ALTER COLUMN "idGates" SET DEFAULT nextval('public."Gates_idGates_seq"'::regclass);


ALTER TABLE ONLY public."ParkingLog" ALTER COLUMN "idParkingLog" SET DEFAULT nextval('public."ParkingLog_idParkingLog_seq"'::regclass);


ALTER TABLE ONLY public."Reservations" ALTER COLUMN "idReservation" SET DEFAULT nextval('public."Reservations_idReservation_seq"'::regclass);


ALTER TABLE ONLY public."Slots" ALTER COLUMN "idSlots" SET DEFAULT nextval('public."Slots_idSlots_seq"'::regclass);


ALTER TABLE ONLY public."SubscriptionPlans" ALTER COLUMN "idSubscriptionPlans" SET DEFAULT nextval('public."SubscriptionPlans_idSubscriptionPlans_seq"'::regclass);


ALTER TABLE ONLY public."UserSubscriptions" ALTER COLUMN "idUserSubscriptions" SET DEFAULT nextval('public."UserSubscriptions_idUserSubscriptions_seq"'::regclass);


--
-- TOC entry 3507 (class 2604 OID 39052)
-- Name: Users idUsers; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users" ALTER COLUMN "idUsers" SET DEFAULT nextval('public."Users_idUsers_seq"'::regclass);


--
-- TOC entry 3496 (class 2604 OID 38976)
-- Name: test_table id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_table ALTER COLUMN id SET DEFAULT nextval('public.test_table_id_seq'::regclass);


--
-- TOC entry 3723 (class 0 OID 39154)
-- Dependencies: 234
-- Data for Name: Areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Areas" ("idAreas", "AreaName", "CityID") VALUES (5, 'A', 4);
INSERT INTO public."Areas" ("idAreas", "AreaName", "CityID") VALUES (6, 'B', 4);
INSERT INTO public."Areas" ("idAreas", "AreaName", "CityID") VALUES (7, 'C', 4);
INSERT INTO public."Areas" ("idAreas", "AreaName", "CityID") VALUES (8, 'D', 4);
INSERT INTO public."Areas" ("idAreas", "AreaName", "CityID") VALUES (9, 'E', 4);
INSERT INTO public."Areas" ("idAreas", "AreaName", "CityID") VALUES (10, 'F', 4);


--
-- TOC entry 3707 (class 0 OID 38994)
-- Dependencies: 218
-- Data for Name: Cars; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3721 (class 0 OID 39135)
-- Dependencies: 232
-- Data for Name: Cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Cities" ("idCities", "CityName", "FullAddress") VALUES (4, 'Updated City Name', '456 New Address, Updated City, UC 67890');


--
-- TOC entry 3709 (class 0 OID 39001)
-- Dependencies: 220
-- Data for Name: Gates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3711 (class 0 OID 39012)
-- Dependencies: 222
-- Data for Name: ParkingLog; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3725 (class 0 OID 39173)
-- Dependencies: 236
-- Data for Name: Reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3713 (class 0 OID 39026)
-- Dependencies: 224
-- Data for Name: Slots; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3715 (class 0 OID 39033)
-- Dependencies: 226
-- Data for Name: SubscriptionPlans; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3717 (class 0 OID 39042)
-- Dependencies: 228
-- Data for Name: UserSubscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3719 (class 0 OID 39049)
-- Dependencies: 230
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Users" ("idUsers", "persId", "FirstName", "LastName", "Phone", "Email", "Password", violations, role) VALUES (1, '123456789', 'Admin', 'User', '1234567890', 'admin@example.com', '$2b$10$dul3mzVUgV9TIrlpVD9QQupnCwQm6A5qcbAJL0IPIQp3yGzGfJTRm', 0, 'admin');


--
-- TOC entry 3703 (class 0 OID 38963)
-- Dependencies: 214
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('0ac9f5ad-678f-4c3e-8b15-607cdd4834cd', '80376a2d9a2dc6f66a706a17f4bf2ada73bf7befca3ef37809b54e2a0c0cdbe4', '2024-08-28 12:54:08.80916+03', '20240828095408_add_role_to_users_default_to_slots', NULL, NULL, '2024-08-28 12:54:08.807106+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('8094a823-c6b1-4706-bdda-2bc1a331419f', 'cbe64dc1aaedcd7840ef4006e9a0da013b4f040b4f710f41bf4e6596e1db5bfa', '2024-08-28 12:53:42.088968+03', '20240818161802_add_unique_email', NULL, NULL, '2024-08-28 12:53:42.057755+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('8eb76bf0-47eb-4e88-a261-357a4d5d5eb3', '2f99b593cef6ea7940c4e0b627e8d13571e9a0f11f080d237a782a3bd5a312c3', '2024-08-28 12:53:42.092865+03', '20240818164258_update_pers_id_type', NULL, NULL, '2024-08-28 12:53:42.089483+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('ba3a3eb1-023c-4e76-8522-bb644ce642ec', '4398b96ae35860c014855f83fe4110ef496c7ad746158ebb80b50458b8323342', '2024-08-28 12:53:42.096142+03', '20240818165254_per_id_varchar_9', NULL, NULL, '2024-08-28 12:53:42.093467+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('17565be8-c108-4162-8a5a-ddb893296bbb', '449594f1a49e3c5a5bf94fe1499285dee5cea7c65752290f3df1375c07c0f5ed', '2024-08-28 13:31:45.779754+03', '20240828103145_remove_borders_and_slot_fields', NULL, NULL, '2024-08-28 13:31:45.755763+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('f10f11a8-c50a-45bb-9f4a-7c81592bf0af', '437bede022d9e61d511045b9749c1da2d868a3c8375522ca2237d11f3c268fb1', '2024-08-28 12:53:42.097732+03', '20240820162303_add_stripe_session_id', NULL, NULL, '2024-08-28 12:53:42.096801+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('73cf5c3b-df9c-42d2-8d63-88fdda200c25', '7a3c742353474c7afc12ca3ccb0807f0457b4145491aa52033617a42424b0d1b', '2024-08-28 12:53:42.101676+03', '20240823133206_rename_areas_to_cities_add_address', NULL, NULL, '2024-08-28 12:53:42.098162+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('76f361a1-e699-4373-aba5-1ec15e94b605', '4f7d21efab59fdb4a0e10489d563018feb9cba82ccb2025fa812c11cefe3da26', '2024-08-28 12:53:42.106321+03', '20240824075313_add_areas_table', NULL, NULL, '2024-08-28 12:53:42.102149+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('d2f83027-bb90-43d2-83bd-bf7d704a6ced', 'f3026d5949a084d4b4976727e837151e1543d1b25b016576387cf73021bce3ca', '2024-09-01 18:17:42.453077+03', '20240901151742_cascade_delete_update', NULL, NULL, '2024-09-01 18:17:42.448559+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('59d38891-7290-4c2b-8d98-f74d9f1cd67a', '88ec9181197cc82406e0aba3c8ac7708cc9c03f38c1b5ca9eb93583d46a8632d', '2024-08-28 12:53:42.108229+03', '20240824084509_add_max_active_reservations', NULL, NULL, '2024-08-28 12:53:42.106985+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('bbf297ef-d9b0-422a-bc19-009a592f1f99', '76fca3d7fc92607489e5ff84f34217884e8845b3a25c83011d1bff16018635eb', '2024-08-28 12:53:42.113997+03', '20240824101246_update_reservation_models_and_relations', NULL, NULL, '2024-08-28 12:53:42.108745+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('6e90bc53-9063-42e2-8e0c-2d844c63da3b', 'c3b3c76f5bbb0cd30aa9e6529f4691c479abd896e13bfeefad3a7f1cdff0b7bb', '2024-08-28 12:53:42.116559+03', '20240824182520_remove_status_field', NULL, NULL, '2024-08-28 12:53:42.114906+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('256880b9-ba63-4cad-a513-c8f657eb40ae', '105e4cdb54c720afc2655d4f99e544d97bc209de414c596c19dfac0a2a5c481c', '2024-09-01 23:17:13.827506+03', '20240901201713_add_gate_and_camera_ip_to_gates', NULL, NULL, '2024-09-01 23:17:13.824198+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('4865c5dd-fec0-4515-95fe-14f4fa5a7f80', '7468e346fa5d1dc5396632728ea73c776983efe33da37e0e20fe28117e6ddf8f', '2024-08-28 12:53:42.118729+03', '20240824190454_link_log_and_reservations_added_violations', NULL, NULL, '2024-08-28 12:53:42.117204+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('533c37aa-d951-4e13-a813-22a4a23ce3a8', '3a1ea99376c9e66738b8991eb39b2ca12a2eb32d5614630668de524b622b8681', '2024-08-28 12:53:42.120368+03', '20240824191050_add_status_back_to_reservations', NULL, NULL, '2024-08-28 12:53:42.119294+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('e6b9219b-576a-425d-bedb-2ee1bcf265ca', '06bc70cd55f7dc984c74c71d6291e3b0053b863c74d30dd57c43b29988815638', '2024-08-28 12:53:42.12226+03', '20240825190529_add_parking_log_times', NULL, NULL, '2024-08-28 12:53:42.121083+03', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('7ffd5aa3-7c5d-4b6f-bce1-ae6c6ad0a54e', 'e7d73036f177ea518020a3cbbe785623355e4edbebe79fa7eb1137c923bd64ea', '2024-09-01 23:21:25.595388+03', '20240901202125_add_camera_ip_slot_ip_to_slots', NULL, NULL, '2024-09-01 23:21:25.590508+03', 1);


--
-- TOC entry 3705 (class 0 OID 38973)
-- Dependencies: 216
-- Data for Name: test_table; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3743 (class 0 OID 0)
-- Dependencies: 233
-- Name: Areas_idAreas_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Areas_idAreas_seq"', 10, true);


--
-- TOC entry 3744 (class 0 OID 0)
-- Dependencies: 217
-- Name: Cars_idCars_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Cars_idCars_seq"', 1, false);


--
-- TOC entry 3745 (class 0 OID 0)
-- Dependencies: 231
-- Name: Cities_idCities_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Cities_idCities_seq"', 4, true);


--
-- TOC entry 3746 (class 0 OID 0)
-- Dependencies: 219
-- Name: Gates_idGates_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Gates_idGates_seq"', 1, false);


--
-- TOC entry 3747 (class 0 OID 0)
-- Dependencies: 221
-- Name: ParkingLog_idParkingLog_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ParkingLog_idParkingLog_seq"', 1, false);


--
-- TOC entry 3748 (class 0 OID 0)
-- Dependencies: 235
-- Name: Reservations_idReservation_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Reservations_idReservation_seq"', 1, false);


--
-- TOC entry 3749 (class 0 OID 0)
-- Dependencies: 223
-- Name: Slots_idSlots_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Slots_idSlots_seq"', 18, true);


--
-- TOC entry 3750 (class 0 OID 0)
-- Dependencies: 225
-- Name: SubscriptionPlans_idSubscriptionPlans_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SubscriptionPlans_idSubscriptionPlans_seq"', 1, false);


--
-- TOC entry 3751 (class 0 OID 0)
-- Dependencies: 227
-- Name: UserSubscriptions_idUserSubscriptions_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."UserSubscriptions_idUserSubscriptions_seq"', 1, false);


--
-- TOC entry 3752 (class 0 OID 0)
-- Dependencies: 229
-- Name: Users_idUsers_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_idUsers_seq"', 1, true);


--
-- TOC entry 3753 (class 0 OID 0)
-- Dependencies: 215
-- Name: test_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_table_id_seq', 1, false);


--
-- TOC entry 3545 (class 2606 OID 39159)
-- Name: Areas Areas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Areas"
    ADD CONSTRAINT "Areas_pkey" PRIMARY KEY ("idAreas");


--
-- TOC entry 3520 (class 2606 OID 38999)
-- Name: Cars Cars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cars"
    ADD CONSTRAINT "Cars_pkey" PRIMARY KEY ("idCars");


--
-- TOC entry 3542 (class 2606 OID 39140)
-- Name: Cities Cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cities"
    ADD CONSTRAINT "Cities_pkey" PRIMARY KEY ("idCities");


--
-- TOC entry 3524 (class 2606 OID 39006)
-- Name: Gates Gates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Gates"
    ADD CONSTRAINT "Gates_pkey" PRIMARY KEY ("idGates");


--
-- TOC entry 3526 (class 2606 OID 39017)
-- Name: ParkingLog ParkingLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ParkingLog"
    ADD CONSTRAINT "ParkingLog_pkey" PRIMARY KEY ("idParkingLog");


--
-- TOC entry 3547 (class 2606 OID 39180)
-- Name: Reservations Reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservations"
    ADD CONSTRAINT "Reservations_pkey" PRIMARY KEY ("idReservation");


--
-- TOC entry 3530 (class 2606 OID 39031)
-- Name: Slots Slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Slots"
    ADD CONSTRAINT "Slots_pkey" PRIMARY KEY ("idSlots");


--
-- TOC entry 3533 (class 2606 OID 39040)
-- Name: SubscriptionPlans SubscriptionPlans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubscriptionPlans"
    ADD CONSTRAINT "SubscriptionPlans_pkey" PRIMARY KEY ("idSubscriptionPlans");


--
-- TOC entry 3536 (class 2606 OID 39047)
-- Name: UserSubscriptions UserSubscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSubscriptions"
    ADD CONSTRAINT "UserSubscriptions_pkey" PRIMARY KEY ("idUserSubscriptions");


--
-- TOC entry 3539 (class 2606 OID 39054)
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("idUsers");


--
-- TOC entry 3515 (class 2606 OID 38971)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3517 (class 2606 OID 38978)
-- Name: test_table test_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_table
    ADD CONSTRAINT test_table_pkey PRIMARY KEY (id);


--
-- TOC entry 3543 (class 1259 OID 39160)
-- Name: Areas_AreaName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Areas_AreaName_key" ON public."Areas" USING btree ("AreaName");


--
-- TOC entry 3518 (class 1259 OID 39056)
-- Name: Cars_RegistrationID_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cars_RegistrationID_key" ON public."Cars" USING btree ("RegistrationID");


--
-- TOC entry 3540 (class 1259 OID 39141)
-- Name: Cities_CityName_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cities_CityName_key" ON public."Cities" USING btree ("CityName");


--
-- TOC entry 3521 (class 1259 OID 43812)
-- Name: Gates_CameraIP_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Gates_CameraIP_key" ON public."Gates" USING btree ("CameraIP");


--
-- TOC entry 3522 (class 1259 OID 43811)
-- Name: Gates_GateIP_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Gates_GateIP_key" ON public."Gates" USING btree ("GateIP");


--
-- TOC entry 3527 (class 1259 OID 43814)
-- Name: Slots_CameraIP_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Slots_CameraIP_key" ON public."Slots" USING btree ("CameraIP");


--
-- TOC entry 3528 (class 1259 OID 43813)
-- Name: Slots_SlotIP_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Slots_SlotIP_key" ON public."Slots" USING btree ("SlotIP");


--
-- TOC entry 3531 (class 1259 OID 39058)
-- Name: SubscriptionPlans_Name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SubscriptionPlans_Name_key" ON public."SubscriptionPlans" USING btree ("Name");


--
-- TOC entry 3534 (class 1259 OID 39142)
-- Name: UserSubscriptions_UserID_Status_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserSubscriptions_UserID_Status_key" ON public."UserSubscriptions" USING btree ("UserID", "Status");


--
-- TOC entry 3537 (class 1259 OID 39059)
-- Name: Users_Email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Users_Email_key" ON public."Users" USING btree ("Email");


--
-- TOC entry 3560 (class 2620 OID 40699)
-- Name: Slots slot_change_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER slot_change_trigger AFTER INSERT OR UPDATE ON public."Slots" FOR EACH ROW EXECUTE FUNCTION public.notify_slot_change();


--
-- TOC entry 3556 (class 2606 OID 41692)
-- Name: Areas Areas_CityID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Areas"
    ADD CONSTRAINT "Areas_CityID_fkey" FOREIGN KEY ("CityID") REFERENCES public."Cities"("idCities") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3548 (class 2606 OID 39060)
-- Name: Cars Cars_OwnerID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cars"
    ADD CONSTRAINT "Cars_OwnerID_fkey" FOREIGN KEY ("OwnerID") REFERENCES public."Users"("idUsers");


--
-- TOC entry 3549 (class 2606 OID 41697)
-- Name: Gates Gates_CityID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Gates"
    ADD CONSTRAINT "Gates_CityID_fkey" FOREIGN KEY ("CityID") REFERENCES public."Cities"("idCities") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3550 (class 2606 OID 39181)
-- Name: ParkingLog ParkingLog_CarID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ParkingLog"
    ADD CONSTRAINT "ParkingLog_CarID_fkey" FOREIGN KEY ("CarID") REFERENCES public."Cars"("idCars") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3551 (class 2606 OID 39207)
-- Name: ParkingLog ParkingLog_ReservationID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ParkingLog"
    ADD CONSTRAINT "ParkingLog_ReservationID_fkey" FOREIGN KEY ("ReservationID") REFERENCES public."Reservations"("idReservation") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3552 (class 2606 OID 39186)
-- Name: ParkingLog ParkingLog_SlotID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ParkingLog"
    ADD CONSTRAINT "ParkingLog_SlotID_fkey" FOREIGN KEY ("SlotID") REFERENCES public."Slots"("idSlots") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3557 (class 2606 OID 39196)
-- Name: Reservations Reservations_CarID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservations"
    ADD CONSTRAINT "Reservations_CarID_fkey" FOREIGN KEY ("CarID") REFERENCES public."Cars"("idCars") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3558 (class 2606 OID 39191)
-- Name: Reservations Reservations_SlotID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservations"
    ADD CONSTRAINT "Reservations_SlotID_fkey" FOREIGN KEY ("SlotID") REFERENCES public."Slots"("idSlots") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3559 (class 2606 OID 39201)
-- Name: Reservations Reservations_UserID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservations"
    ADD CONSTRAINT "Reservations_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES public."Users"("idUsers") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3553 (class 2606 OID 41702)
-- Name: Slots Slots_AreaID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Slots"
    ADD CONSTRAINT "Slots_AreaID_fkey" FOREIGN KEY ("AreaID") REFERENCES public."Areas"("idAreas") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3554 (class 2606 OID 39110)
-- Name: UserSubscriptions SubscriptionPlan_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSubscriptions"
    ADD CONSTRAINT "SubscriptionPlan_fk" FOREIGN KEY ("SubscriptionPlanID") REFERENCES public."SubscriptionPlans"("idSubscriptionPlans");


--
-- TOC entry 3555 (class 2606 OID 39115)
-- Name: UserSubscriptions User_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSubscriptions"
    ADD CONSTRAINT "User_fk" FOREIGN KEY ("UserID") REFERENCES public."Users"("idUsers") ON DELETE CASCADE;


--
-- TOC entry 3731 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2024-09-02 11:30:32 IDT

--
-- PostgreSQL database dump complete
--

