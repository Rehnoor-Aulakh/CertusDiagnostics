--
-- PostgreSQL database dump
--

\restrict 6BuOi5ZHzGnqai6LIRDbUC8fzqsTaa9YZenONopSL3dVu3OakhIQbrqrLSWr93n

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
-- Name: gender_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gender_enum AS ENUM (
    'Male',
    'Female',
    'Other'
);


ALTER TYPE public.gender_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.admin OWNER TO postgres;

--
-- Name: admin_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_admin_id_seq OWNER TO postgres;

--
-- Name: admin_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_admin_id_seq OWNED BY public.admin.admin_id;


--
-- Name: admin_otp; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.admin_otp OWNER TO postgres;

--
-- Name: admin_otp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_otp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_otp_id_seq OWNER TO postgres;

--
-- Name: admin_otp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_otp_id_seq OWNED BY public.admin_otp.id;


--
-- Name: google_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.google_reviews (
    id bigint NOT NULL,
    author character varying(255) DEFAULT NULL::character varying,
    rating real,
    review_text text,
    review_time timestamp with time zone
);


ALTER TABLE public.google_reviews OWNER TO postgres;

--
-- Name: google_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.google_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.google_reviews_id_seq OWNER TO postgres;

--
-- Name: google_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.google_reviews_id_seq OWNED BY public.google_reviews.id;


--
-- Name: packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.packages (
    package_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    photo character varying(255) DEFAULT NULL::character varying,
    date_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.packages OWNER TO postgres;

--
-- Name: packages_package_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.packages_package_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.packages_package_id_seq OWNER TO postgres;

--
-- Name: packages_package_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.packages_package_id_seq OWNED BY public.packages.package_id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    patient_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(15) DEFAULT NULL::character varying,
    password character varying(255),
    dob date,
    age integer CHECK ((age IS NULL) OR ((age >= 0) AND (age <= 130))),
    gender public.gender_enum,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    google_id character varying(255) DEFAULT NULL::character varying,
    profile_picture character varying(500) DEFAULT NULL::character varying,
    email_verified boolean DEFAULT false,
    last_login timestamp with time zone
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_patient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_patient_id_seq OWNER TO postgres;

--
-- Name: patients_patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_patient_id_seq OWNED BY public.patients.patient_id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    report_id bigint NOT NULL,
    patient_id bigint NOT NULL,
    test_name character varying(255) NOT NULL,
    price numeric(10,2) DEFAULT 0.0 NOT NULL,
    report_location character varying(255) DEFAULT NULL::character varying,
    test_date_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    report_released_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tests_included jsonb DEFAULT '[]'::jsonb NOT NULL,
    tests_data jsonb,
    abnormal_data jsonb
);


--
-- Name: patient_identity_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_identity_mapping (
    real_name character varying(255) NOT NULL,
    fake_patient_id bigint NOT NULL
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: reports_report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_report_id_seq OWNER TO postgres;

--
-- Name: reports_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_report_id_seq OWNED BY public.reports.report_id;


--
-- Name: admin admin_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin ALTER COLUMN admin_id SET DEFAULT nextval('public.admin_admin_id_seq'::regclass);


--
-- Name: admin_otp id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_otp ALTER COLUMN id SET DEFAULT nextval('public.admin_otp_id_seq'::regclass);


--
-- Name: google_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_reviews ALTER COLUMN id SET DEFAULT nextval('public.google_reviews_id_seq'::regclass);


--
-- Name: packages package_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages ALTER COLUMN package_id SET DEFAULT nextval('public.packages_package_id_seq'::regclass);


--
-- Name: patients patient_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN patient_id SET DEFAULT nextval('public.patients_patient_id_seq'::regclass);


--
-- Name: reports report_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN report_id SET DEFAULT nextval('public.reports_report_id_seq'::regclass);


--
-- Name: admin admin_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_email_key UNIQUE (email);


--
-- Name: admin_otp admin_otp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_otp
    ADD CONSTRAINT admin_otp_pkey PRIMARY KEY (id);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (admin_id);


--
-- Name: google_reviews google_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_reviews
    ADD CONSTRAINT google_reviews_pkey PRIMARY KEY (id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (package_id);


--
-- Name: patients patients_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_key UNIQUE (email);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- Name: patient_identity_mapping patient_identity_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_identity_mapping
    ADD CONSTRAINT patient_identity_mapping_pkey PRIMARY KEY (real_name);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);


--
-- Name: idx_patients_google_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patients_google_id ON public.patients USING btree (google_id);


--
-- Name: idx_reports_patient_data; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_patient_data ON public.reports USING btree (patient_id, test_date_time);


--
-- Name: idx_reports_test_data_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_test_data_gin ON public.reports USING gin (tests_data);


--
-- Name: idx_reports_tests_included_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_tests_included_gin ON public.reports USING gin (tests_included);


--
-- Name: uq_admin_google_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_admin_google_id ON public.admin USING btree (google_id) WHERE (google_id IS NOT NULL);


--
-- Name: uq_unique_review; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_unique_review ON public.google_reviews USING btree (author, review_time);


--
-- Name: reports fk_reports_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT fk_reports_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: patient_identity_mapping fk_patient_identity_mapping_patient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_identity_mapping
    ADD CONSTRAINT fk_patient_identity_mapping_patient FOREIGN KEY (fake_patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 6BuOi5ZHzGnqai6LIRDbUC8fzqsTaa9YZenONopSL3dVu3OakhIQbrqrLSWr93n
