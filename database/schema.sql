--
-- PostgreSQL database dump
--

\restrict QbnjpADbpKTCGi2quTpmwmop1IFfo6GhqmlzOT82M2CZLpxq5D47qnZ8VmSU5M5

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: gender_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.gender_enum AS ENUM (
    'Male',
    'Female',
    'Other'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin (
    admin_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(15) DEFAULT NULL::character varying,
    password character varying(255) DEFAULT NULL::character varying,
    google_id character varying(255) DEFAULT NULL::character varying,
    profile_picture character varying(500) DEFAULT NULL::character varying,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status character varying(20) DEFAULT 'APPROVED'::character varying,
    approval_token character varying(255)
);


--
-- Name: admin_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_admin_id_seq OWNED BY public.admin.admin_id;


--
-- Name: admin_otp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_otp (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    otp character varying(10) NOT NULL,
    google_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false
);


--
-- Name: admin_otp_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_otp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_otp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_otp_id_seq OWNED BY public.admin_otp.id;


--
-- Name: google_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_reviews (
    id bigint NOT NULL,
    author character varying(255) DEFAULT NULL::character varying,
    rating real,
    review_text text,
    review_time timestamp with time zone
);


--
-- Name: google_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.google_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: google_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.google_reviews_id_seq OWNED BY public.google_reviews.id;


--
-- Name: packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.packages (
    package_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    photo character varying(255) DEFAULT NULL::character varying,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: packages_package_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.packages_package_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: packages_package_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.packages_package_id_seq OWNED BY public.packages.package_id;


--
-- Name: patient_identity_mapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_identity_mapping (
    real_name character varying(255) NOT NULL,
    fake_patient_id bigint
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    patient_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(30) DEFAULT NULL::character varying,
    password character varying(255),
    dob date,
    gender public.gender_enum,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    google_id character varying(255) DEFAULT NULL::character varying,
    profile_picture character varying(500) DEFAULT NULL::character varying,
    email_verified boolean DEFAULT false,
    last_login timestamp with time zone
);


--
-- Name: patients_patient_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patients_patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: patients_patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patients_patient_id_seq OWNED BY public.patients.patient_id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    report_id bigint NOT NULL,
    patient_id bigint NOT NULL,
    test_name character varying(255) NOT NULL,
    price numeric(10,2) DEFAULT 0.0 NOT NULL,
    report_location character varying(255) DEFAULT NULL::character varying,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tests_included jsonb DEFAULT '[]'::jsonb NOT NULL,
    tests_data jsonb,
    abnormal_data jsonb,
    sample_collected_on timestamp with time zone,
    sample_received_on timestamp with time zone,
    report_released_on timestamp with time zone,
    report_date timestamp with time zone,
    report_status character varying(20),
    report_hash character varying(64),
    CONSTRAINT chk_report_status CHECK (((report_status)::text = ANY ((ARRAY['PENDING'::character varying, 'COMPLETED'::character varying, 'COMPLETE'::character varying])::text[])))
);


--
-- Name: reports_report_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_report_id_seq OWNED BY public.reports.report_id;


--
-- Name: admin admin_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin ALTER COLUMN admin_id SET DEFAULT nextval('public.admin_admin_id_seq'::regclass);


--
-- Name: admin_otp id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_otp ALTER COLUMN id SET DEFAULT nextval('public.admin_otp_id_seq'::regclass);


--
-- Name: google_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_reviews ALTER COLUMN id SET DEFAULT nextval('public.google_reviews_id_seq'::regclass);


--
-- Name: packages package_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages ALTER COLUMN package_id SET DEFAULT nextval('public.packages_package_id_seq'::regclass);


--
-- Name: patients patient_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients ALTER COLUMN patient_id SET DEFAULT nextval('public.patients_patient_id_seq'::regclass);


--
-- Name: reports report_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports ALTER COLUMN report_id SET DEFAULT nextval('public.reports_report_id_seq'::regclass);


--
-- Name: admin admin_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_email_key UNIQUE (email);


--
-- Name: admin_otp admin_otp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_otp
    ADD CONSTRAINT admin_otp_pkey PRIMARY KEY (id);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (admin_id);


--
-- Name: google_reviews google_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_reviews
    ADD CONSTRAINT google_reviews_pkey PRIMARY KEY (id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (package_id);


--
-- Name: patient_identity_mapping patient_identity_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_identity_mapping
    ADD CONSTRAINT patient_identity_mapping_pkey PRIMARY KEY (real_name);


--
-- Name: patients patients_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_key UNIQUE (email);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);


--
-- Name: idx_patients_google_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_patients_google_id ON public.patients USING btree (google_id);


--
-- Name: idx_reports_report_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_reports_report_hash ON public.reports USING btree (report_hash);


--
-- Name: idx_reports_test_data_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_test_data_gin ON public.reports USING gin (tests_data);


--
-- Name: idx_reports_tests_included_gin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reports_tests_included_gin ON public.reports USING gin (tests_included);


--
-- Name: uq_admin_google_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_admin_google_id ON public.admin USING btree (google_id) WHERE (google_id IS NOT NULL);


--
-- Name: uq_unique_review; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_unique_review ON public.google_reviews USING btree (author, review_time);


--
-- Name: reports fk_reports_patient; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_reports_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: patient_identity_mapping patient_identity_mapping_fake_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_identity_mapping
    ADD CONSTRAINT patient_identity_mapping_fake_patient_id_fkey FOREIGN KEY (fake_patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict QbnjpADbpKTCGi2quTpmwmop1IFfo6GhqmlzOT82M2CZLpxq5D47qnZ8VmSU5M5

