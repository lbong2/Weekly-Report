--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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

ALTER TABLE IF EXISTS ONLY public.weekly_reports DROP CONSTRAINT IF EXISTS weekly_reports_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_weekly_report_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_issue_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_chain_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issues DROP CONSTRAINT IF EXISTS issues_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issues DROP CONSTRAINT IF EXISTS issues_chain_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issue_assignees DROP CONSTRAINT IF EXISTS issue_assignees_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issue_assignees DROP CONSTRAINT IF EXISTS issue_assignees_issue_id_fkey;
ALTER TABLE IF EXISTS ONLY public.chain_assignees DROP CONSTRAINT IF EXISTS chain_assignees_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.chain_assignees DROP CONSTRAINT IF EXISTS chain_assignees_chain_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendances DROP CONSTRAINT IF EXISTS attendances_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendances DROP CONSTRAINT IF EXISTS attendances_type_id_fkey;
DROP INDEX IF EXISTS public.weekly_reports_team_id_year_week_number_key;
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public.task_assignees_task_id_user_id_key;
DROP INDEX IF EXISTS public.issue_assignees_issue_id_user_id_key;
DROP INDEX IF EXISTS public.chains_code_key;
DROP INDEX IF EXISTS public.chain_assignees_chain_id_user_id_key;
DROP INDEX IF EXISTS public.attendance_types_code_key;
ALTER TABLE IF EXISTS ONLY public.weekly_reports DROP CONSTRAINT IF EXISTS weekly_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS teams_pkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.task_assignees DROP CONSTRAINT IF EXISTS task_assignees_pkey;
ALTER TABLE IF EXISTS ONLY public.issues DROP CONSTRAINT IF EXISTS issues_pkey;
ALTER TABLE IF EXISTS ONLY public.issue_assignees DROP CONSTRAINT IF EXISTS issue_assignees_pkey;
ALTER TABLE IF EXISTS ONLY public.chains DROP CONSTRAINT IF EXISTS chains_pkey;
ALTER TABLE IF EXISTS ONLY public.chain_assignees DROP CONSTRAINT IF EXISTS chain_assignees_pkey;
ALTER TABLE IF EXISTS ONLY public.attendances DROP CONSTRAINT IF EXISTS attendances_pkey;
ALTER TABLE IF EXISTS ONLY public.attendance_types DROP CONSTRAINT IF EXISTS attendance_types_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.weekly_reports;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.teams;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.task_assignees;
DROP TABLE IF EXISTS public.issues;
DROP TABLE IF EXISTS public.issue_assignees;
DROP TABLE IF EXISTS public.chains;
DROP TABLE IF EXISTS public.chain_assignees;
DROP TABLE IF EXISTS public.attendances;
DROP TABLE IF EXISTS public.attendance_types;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."ReportStatus";
DROP TYPE IF EXISTS public."Position";
DROP TYPE IF EXISTS public."IssueStatus";
DROP TYPE IF EXISTS public."AttendanceCategory";
--
-- Name: AttendanceCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AttendanceCategory" AS ENUM (
    'LEAVE',
    'BUSINESS_TRIP'
);


ALTER TYPE public."AttendanceCategory" OWNER TO postgres;

--
-- Name: IssueStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IssueStatus" AS ENUM (
    'BACKLOG',
    'IN_PROGRESS',
    'DONE',
    'HOLD'
);


ALTER TYPE public."IssueStatus" OWNER TO postgres;

--
-- Name: Position; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Position" AS ENUM (
    'STAFF',
    'MANAGER',
    'TEAM_LEAD'
);


ALTER TYPE public."Position" OWNER TO postgres;

--
-- Name: ReportStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReportStatus" AS ENUM (
    'DRAFT',
    'COMPLETED'
);


ALTER TYPE public."ReportStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

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

--
-- Name: attendance_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    category public."AttendanceCategory" NOT NULL,
    is_long_term boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.attendance_types OWNER TO postgres;

--
-- Name: attendances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendances (
    id text NOT NULL,
    user_id text NOT NULL,
    type_id text NOT NULL,
    content text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    location text,
    remarks text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.attendances OWNER TO postgres;

--
-- Name: chain_assignees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chain_assignees (
    id text NOT NULL,
    chain_id text NOT NULL,
    user_id text NOT NULL
);


ALTER TABLE public.chain_assignees OWNER TO postgres;

--
-- Name: chains; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chains (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.chains OWNER TO postgres;

--
-- Name: issue_assignees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issue_assignees (
    id text NOT NULL,
    issue_id text NOT NULL,
    user_id text NOT NULL
);


ALTER TABLE public.issue_assignees OWNER TO postgres;

--
-- Name: issues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issues (
    id text NOT NULL,
    team_id text NOT NULL,
    chain_id text NOT NULL,
    title text NOT NULL,
    status public."IssueStatus" DEFAULT 'IN_PROGRESS'::public."IssueStatus" NOT NULL,
    purpose text,
    start_date date,
    end_date date,
    total_count integer DEFAULT 0 NOT NULL,
    completed_count integer DEFAULT 0 NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.issues OWNER TO postgres;

--
-- Name: task_assignees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_assignees (
    id text NOT NULL,
    task_id text NOT NULL,
    user_id text NOT NULL
);


ALTER TABLE public.task_assignees OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id text NOT NULL,
    weekly_report_id text NOT NULL,
    chain_id text NOT NULL,
    title text NOT NULL,
    purpose text,
    start_date date,
    end_date date,
    total_count integer DEFAULT 0 NOT NULL,
    completed_count integer DEFAULT 0 NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    this_week_content text,
    next_week_content text,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    next_completed_count integer DEFAULT 0 NOT NULL,
    next_progress integer DEFAULT 0 NOT NULL,
    next_total_count integer DEFAULT 0 NOT NULL,
    show_next_week_achievement boolean DEFAULT true NOT NULL,
    show_this_week_achievement boolean DEFAULT true NOT NULL,
    issue_id text
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id text NOT NULL,
    name text NOT NULL,
    location text,
    total_members integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    team_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    "position" public."Position" DEFAULT 'STAFF'::public."Position" NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: weekly_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weekly_reports (
    id text NOT NULL,
    team_id text NOT NULL,
    year integer NOT NULL,
    week_number integer NOT NULL,
    week_start date NOT NULL,
    week_end date NOT NULL,
    status public."ReportStatus" DEFAULT 'DRAFT'::public."ReportStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.weekly_reports OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
15015126-4060-4b5f-8ed8-fe3df388a488	35029752421506334b11a079c73ca371aa29c05907e05c90bd7d71c17e5db317	2026-01-08 09:48:07.501316+00	20260108094807_init	\N	\N	2026-01-08 09:48:07.410996+00	1
fdc432ef-3ee6-4914-a7ce-184e8614e358	b79e6f1920e4be2b9c81a8c5f183c0c39a6ce4b85f0eb0e90998b8dd2a3d7314	2026-01-10 09:51:48.227582+00	20260110095148_add_task_next_week_fields	\N	\N	2026-01-10 09:51:48.218008+00	1
71ec51aa-a7c0-4cc7-97cd-c4c4555331a8	99278a0ad4e11f7abfdf21912f27646bf4a6f8ee13f76fa11850a08b75910287	2026-01-10 09:56:12.965877+00	20260110095612_add_show_this_week_achievement	\N	\N	2026-01-10 09:56:12.958022+00	1
2dbfbfa3-1db9-46f9-ac02-6f6fbab09a88	302ff6f053ab3e5926b132cad83828b9a4a32b0bf8e546e91c2b10a01fe92894	2026-01-10 10:07:50.970863+00	20260110100750_add_issue_model	\N	\N	2026-01-10 10:07:50.923357+00	1
77242693-f70b-40e3-a540-b1656fdf89e8	e1543127495d753a947af825252c8937027e755b5410667101b52de440e1d773	2026-01-10 11:43:33.898886+00	20260110114333_add_user_position	\N	\N	2026-01-10 11:43:33.889801+00	1
aeb2bc04-3b2b-4665-8acf-4ec55386f0c0	e0edaf2570e9b3849fe3b20a01b9541e747eec4a14129be230e050789eebd475	2026-01-10 14:23:10.064881+00	20260111120000_remove_attendance_weekly_report_id	\N	\N	2026-01-10 14:23:10.047081+00	1
146bfd00-292d-4427-a2e6-2abf38da7811	36de684b8d14b37ecc6c2574788a6cf2011c61e7011808aa2843651ab87b4fcf	2026-01-11 03:40:32.729782+00	20260111034032_add_chain_color	\N	\N	2026-01-11 03:40:32.722026+00	1
06a42973-52bd-4e43-bd8e-59f67c92c93c	b0aaed5814b2539ade078dc0e7c5d42f83c129c2d2991d4c8bd903dbeb764a66	2026-01-11 05:00:43.318402+00	20260111050043_add_chain_display_order	\N	\N	2026-01-11 05:00:43.313066+00	1
786d42a7-e74b-4ec0-b687-85cd597cd5ba	b44d686354911e39d1b198637a9e5a5dd5ee86d706cd852654bac921f0dc909f	2026-01-14 12:01:21.25492+00	20260114120121_add_user_display_order	\N	\N	2026-01-14 12:01:21.246701+00	1
fc4ee408-b87e-4003-bc0f-bf18eedbaf2b	4217faff10462360327ba37f2a9a13609f907115fbedc7462ab2b825bddeb57c	2026-01-15 10:57:22.547879+00	20260115105722_add_chain_assignees	\N	\N	2026-01-15 10:57:22.507044+00	1
\.


--
-- Data for Name: attendance_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance_types (id, code, name, category, is_long_term, is_active, created_at, updated_at) FROM stdin;
45d0a33d-0cda-4643-9c84-6923bc549781	ANNUAL	연차	LEAVE	f	t	2026-01-08 09:48:18.134	2026-01-08 09:48:18.134
3e326317-eed8-4c4c-97c9-bdb7cfd8670b	SICK	병가	LEAVE	f	t	2026-01-08 09:48:18.141	2026-01-08 09:48:18.141
ea50c032-81aa-49df-8147-fbad0475ce62	MATERNITY	출산휴가	LEAVE	t	t	2026-01-08 09:48:18.148	2026-01-08 09:48:18.148
bb2bee0d-c5f9-4a0c-a048-727fdb90390c	PARENTAL	육아휴직	LEAVE	t	t	2026-01-08 09:48:18.152	2026-01-08 09:48:18.152
81704a8d-ee15-4e4b-afab-1a4458fd2831	BUSINESS_TRIP	출장	BUSINESS_TRIP	f	t	2026-01-08 09:48:18.16	2026-01-08 09:48:18.16
7040b533-66e4-4f5c-a7ff-ee0bac6bf89d	LONG_BUSINESS_TRIP	장기출장	BUSINESS_TRIP	t	t	2026-01-08 09:48:18.164	2026-01-08 09:48:18.164
ffcc69f2-95a0-440d-9087-aee567c065db	FAMILY_EVENT	경조휴가	LEAVE	t	t	2026-01-08 09:48:18.144	2026-01-10 12:33:42.205
16bff56f-e4b2-40e8-86b2-207639d55043	TRAINING	훈련	LEAVE	f	t	2026-01-11 02:57:21.001	2026-01-11 02:57:21.001
\.


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendances (id, user_id, type_id, content, start_date, end_date, location, remarks, created_at, updated_at) FROM stdin;
4dd456d0-1724-41ef-9141-9b4bfb7bdc38	fb1b8e68-e3ed-46b5-a5f1-f43a19594ffb	81704a8d-ee15-4e4b-afab-1a4458fd2831	스틸샵 시스템 업무 협의	2026-01-12	2026-01-13	\N	\N	2026-01-14 10:24:41.633	2026-01-14 10:24:41.633
53057109-3695-44b2-9872-fd20172fd1bb	1f979db3-aed5-48af-a952-c3824fef3012	81704a8d-ee15-4e4b-afab-1a4458fd2831	스틸샵 시스템 업무 협의	2026-01-12	2026-01-13	\N	\N	2026-01-14 10:24:41.747	2026-01-14 10:24:41.747
e7fafa78-ba11-40bd-9494-5de478fedc93	1f979db3-aed5-48af-a952-c3824fef3012	45d0a33d-0cda-4643-9c84-6923bc549781	refresh휴가(직책자)	2026-01-20	2026-01-26	\N	\N	2026-01-14 10:24:41.857	2026-01-14 10:24:41.857
1e13c3ea-32a4-4718-83a2-f37996281621	17ba60b8-4237-4496-bc19-b71f88edc44f	45d0a33d-0cda-4643-9c84-6923bc549781	\N	2026-01-12	2026-01-12	\N	\N	2026-01-14 10:24:41.967	2026-01-14 10:24:41.967
\.


--
-- Data for Name: chain_assignees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chain_assignees (id, chain_id, user_id) FROM stdin;
32145107-7d2d-4eb2-9819-8fd6ad2af3a1	af3a54f3-797d-4fd4-b40d-5a14a1012f22	e9dd149f-6f1d-4a98-82b8-8b6dac68ad4a
59ddb9f0-8dff-4235-8084-6b148593d7a2	1a3b7b4e-786c-4d0a-b225-745d52cedff7	86facd65-2ea0-423d-9d77-0885e739293c
2f9bd208-1d51-489e-a1e3-a70221a44f43	1a3b7b4e-786c-4d0a-b225-745d52cedff7	fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a
cccbe406-e102-4fbf-809c-50bc562c600b	256fd53f-17f8-4c7b-8200-3406da8e7148	17ba60b8-4237-4496-bc19-b71f88edc44f
be9e00f2-fb00-40b4-aac8-6a3d95c5bfe9	9edb5989-98f6-474f-b7ab-f1dafda636e9	575d1267-2341-4dd8-a622-787403eb5772
c4827052-6f56-423f-92de-e83dd89a7a3d	206996ae-0336-4485-969d-e23cb2c5a38d	fb1b8e68-e3ed-46b5-a5f1-f43a19594ffb
6a507111-eeb5-4c78-a7f9-94315e422762	69f7450c-4754-419e-abaf-97f3011feeda	aeb33f27-3b22-48a9-81f8-8414be744a76
fa81a2c0-e56e-4aad-bd1a-ad46524b2895	047d4be9-a928-4b75-aea4-a7c346895df5	335c9b09-ce76-49a8-b18a-96b638213a45
3963a2ba-68e7-48a1-8cfa-232ce6720bdf	1acadd61-22de-4f72-807c-421f49c2138f	335c9b09-ce76-49a8-b18a-96b638213a45
07fae021-740b-483f-8ada-0ff7fe205008	8ce7b0ef-3be5-4108-a062-249082bff464	335c9b09-ce76-49a8-b18a-96b638213a45
49cd7bcd-19f0-4ba4-ba44-73b8a4cc2a45	c6cb07ae-bcee-413c-b495-5c5099884665	86facd65-2ea0-423d-9d77-0885e739293c
\.


--
-- Data for Name: chains; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chains (id, code, name, is_active, created_at, updated_at, color, display_order) FROM stdin;
af3a54f3-797d-4fd4-b40d-5a14a1012f22	MQC	품질관리	t	2026-01-10 12:31:14.702	2026-01-15 11:09:17.466	#B81414	1
1a3b7b4e-786c-4d0a-b225-745d52cedff7	MPP	조업관리	t	2026-01-08 09:48:18.122	2026-01-15 11:09:21.871	#97B814	2
256fd53f-17f8-4c7b-8200-3406da8e7148	MLS	물류관리	t	2026-01-10 12:30:54.923	2026-01-15 11:09:28.135	#B87614	3
9edb5989-98f6-474f-b7ab-f1dafda636e9	MBH	D-Mega Beam	t	2026-01-08 09:48:18.106	2026-01-15 11:09:32.894	#35B814	4
206996ae-0336-4485-969d-e23cb2c5a38d	APS	공정계획	t	2026-01-08 09:48:18.116	2026-01-15 11:09:39.364	#14B856	5
69f7450c-4754-419e-abaf-97f3011feeda	MST	검사증명서	t	2026-01-11 04:39:58.456	2026-01-15 11:09:44.537	#14B8B8	6
047d4be9-a928-4b75-aea4-a7c346895df5	WGT	계량	t	2026-01-11 04:40:41.754	2026-01-15 11:09:49.464	#1456B8	7
1acadd61-22de-4f72-807c-421f49c2138f	MPR	조업진행 Report	t	2026-01-08 09:48:18.128	2026-01-15 11:09:54.566	#3514B8	8
8ce7b0ef-3be5-4108-a062-249082bff464	MCM	공통관리	t	2026-01-11 04:40:13.628	2026-01-15 11:09:59.388	#9714B8	9
c6cb07ae-bcee-413c-b495-5c5099884665	SCRP	스크랩검수	t	2026-01-14 13:02:02.85	2026-01-15 11:10:02.968	#B81476	10
\.


--
-- Data for Name: issue_assignees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.issue_assignees (id, issue_id, user_id) FROM stdin;
b864dd10-f9ec-4007-8130-8c51e742901a	0dc23155-8cf2-4bb5-97d4-e0dee2ed0a18	e9dd149f-6f1d-4a98-82b8-8b6dac68ad4a
4a396a0e-501e-432a-b7df-8dffc5b1aca2	c3a0db11-ddd3-4920-a602-85e4ac78ce50	e9dd149f-6f1d-4a98-82b8-8b6dac68ad4a
832f592d-8db3-4abe-8f66-1b1dcc54703c	48ffbced-139b-4b1a-a1a0-aa309f857bdb	575d1267-2341-4dd8-a622-787403eb5772
0bd2d599-7d1f-4262-8a95-312579e8c314	36dff6ad-23df-4fb1-8885-5bbd56079ab1	e9dd149f-6f1d-4a98-82b8-8b6dac68ad4a
f1a3d9b4-51bc-48ed-9ad0-964b9c39af53	9194f89a-f3fb-4e5b-a161-0eebdd5f8c83	e9dd149f-6f1d-4a98-82b8-8b6dac68ad4a
a5e03342-6f0a-4f07-bde8-92a6cfaf1b94	da05258f-ffee-4c6c-945b-3e1cf12810ba	e9dd149f-6f1d-4a98-82b8-8b6dac68ad4a
99d929a4-1698-40f3-8b77-fdb426ae3c3a	6f93af00-46b3-45cd-a3a2-5c820146b86a	86facd65-2ea0-423d-9d77-0885e739293c
3e6aa3c8-e231-49a5-8eea-ae778abb4c78	504453d0-93f4-48a5-b765-13a38d650ad2	86facd65-2ea0-423d-9d77-0885e739293c
110843b4-8601-4511-a878-47e89664270b	0bc1c16a-960e-4838-8ee0-c0507b5d88b8	86facd65-2ea0-423d-9d77-0885e739293c
75f61e53-e405-445b-89e3-62fc1b8463b5	66890d27-9500-41c0-8eb8-1811a80481d2	86facd65-2ea0-423d-9d77-0885e739293c
dd85405f-f06f-4688-9921-083a402602b3	3008c439-219e-4ad5-b305-a345338c4c2a	fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a
2a20e06c-9d54-45ba-9602-688362efb48f	770aa3d2-7c71-4907-b352-16b2da5624c5	fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a
86b8cfd1-0267-4d67-ab7f-1522bc6272bf	951ca2b7-6277-4fe9-9a30-01ad5cd1a656	fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a
0b25abed-10d4-4181-9540-683ac9c59a98	5e6c8d5b-a0a1-4b69-ae8b-dd575a94b32f	fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a
f6f77793-b4df-4ce8-9f69-76adee74cf41	f473f69c-5960-41a1-9bd0-61e4a21ef806	17ba60b8-4237-4496-bc19-b71f88edc44f
dceeffd0-3a5d-4e43-9224-f84188219a33	317eeafb-4f9e-495c-9233-d73c84df0c1f	575d1267-2341-4dd8-a622-787403eb5772
ffdb4b96-261a-43dc-b362-c653b4702732	7eaa62ab-e633-4a95-a40a-e95659f1b5e1	575d1267-2341-4dd8-a622-787403eb5772
5e5f3adc-49d5-4655-b3be-9fc9089a86aa	332814a9-681c-46ab-a21e-bc1d3674c77d	fb1b8e68-e3ed-46b5-a5f1-f43a19594ffb
ae7f1f95-71a7-400c-8a7a-eb27fb1bfd70	e5c7e0b2-b6e3-4360-9bde-8232afdbedb5	fb1b8e68-e3ed-46b5-a5f1-f43a19594ffb
1de3603d-5085-4825-9b34-76e7eda70075	c718c963-48c7-4eac-b5a9-4066539cf817	aeb33f27-3b22-48a9-81f8-8414be744a76
1f903209-fb01-435c-9fcb-20ebeb407fa1	b41d18ee-c20d-4329-b17e-d7f379450fd2	aeb33f27-3b22-48a9-81f8-8414be744a76
\.


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.issues (id, team_id, chain_id, title, status, purpose, start_date, end_date, total_count, completed_count, progress, created_at, updated_at) FROM stdin;
5e6c8d5b-a0a1-4b69-ae8b-dd575a94b32f	00000000-0000-0000-0000-000000000001	1a3b7b4e-786c-4d0a-b225-745d52cedff7	형강 라벨 프로그램 개선 요청의 건 	IN_PROGRESS	형강 S8 입고 대기실 라벨 프린터기 오류로 인한 개선	2026-01-06	2026-01-09	1	1	100	2026-01-14 13:14:20.817	2026-01-14 13:14:20.817
f473f69c-5960-41a1-9bd0-61e4a21ef806	00000000-0000-0000-0000-000000000001	256fd53f-17f8-4c7b-8200-3406da8e7148	출하취소 반입 시 중량 계산 개선 건	IN_PROGRESS	PCS단위 출하 취소 반입 시 중량 계산 오류 개선	2025-12-23	2026-01-16	2	2	100	2026-01-14 13:15:25.796	2026-01-14 13:15:25.796
317eeafb-4f9e-495c-9233-d73c84df0c1f	00000000-0000-0000-0000-000000000001	9edb5989-98f6-474f-b7ab-f1dafda636e9	재고현황 및 작업 실적 조회 화면 개발	IN_PROGRESS	재고현황 및 자재별 수불 내역을 파악하기 위해 프로그램 개발	2026-01-09	2026-01-30	2	2	100	2026-01-14 13:16:28.268	2026-01-14 13:16:28.268
7eaa62ab-e633-4a95-a40a-e95659f1b5e1	00000000-0000-0000-0000-000000000001	9edb5989-98f6-474f-b7ab-f1dafda636e9	SSC 처리 실적 조회 프로그램 개선	IN_PROGRESS	화면 내에 모재길이, Loss길이, 출하일자 항목 추가하여 실적 Data 정확도 향상 및 관리 강화	2026-01-01	2026-01-31	0	0	0	2026-01-14 13:17:13.174	2026-01-14 13:17:13.174
332814a9-681c-46ab-a21e-bc1d3674c77d	00000000-0000-0000-0000-000000000001	206996ae-0336-4485-969d-e23cb2c5a38d	SSC 처리 내역 조회 신규 화면 개발	IN_PROGRESS	주문 단위 SSC 실적 관리 편의성 강화	2026-01-01	2026-01-31	0	0	0	2026-01-14 13:33:14.564	2026-01-14 13:33:14.564
e5c7e0b2-b6e3-4360-9bde-8232afdbedb5	00000000-0000-0000-0000-000000000001	206996ae-0336-4485-969d-e23cb2c5a38d	SSC 납기약속 가부 체크 로직 개선	IN_PROGRESS	SSC 납기약속 응답 오류 해결	2026-01-12	2026-01-31	1	1	100	2026-01-14 13:34:02.088	2026-01-14 13:34:02.088
c718c963-48c7-4eac-b5a9-4066539cf817	00000000-0000-0000-0000-000000000001	69f7450c-4754-419e-abaf-97f3011feeda	KOLAS 성과대비표 발행 로직 개선	IN_PROGRESS	KOLAS 성적서 승인 완료 시 성과대비표 자동 발행 로직을 적용하여 업무 효율 및 사용자 편의성 향상	2025-12-31	2026-01-30	0	0	0	2026-01-14 13:34:59.923	2026-01-14 13:34:59.923
b41d18ee-c20d-4329-b17e-d7f379450fd2	00000000-0000-0000-0000-000000000001	69f7450c-4754-419e-abaf-97f3011feeda	사업장별 ASTM 양식 분리	IN_PROGRESS	포항공장 검사증명서 간 동일 양식 유지	2026-01-08	2026-02-28	2	0	0	2026-01-14 13:35:55.263	2026-01-14 13:35:55.263
0dc23155-8cf2-4bb5-97d4-e0dee2ed0a18	00000000-0000-0000-0000-000000000001	af3a54f3-797d-4fd4-b40d-5a14a1012f22	ㅂㅈㄷ	DONE	ㅁㄴㅇ	2026-01-01	2026-01-31	2	1	50	2026-01-10 15:03:34.866	2026-01-14 12:49:43.547
c3a0db11-ddd3-4920-a602-85e4ac78ce50	00000000-0000-0000-0000-000000000001	1acadd61-22de-4f72-807c-421f49c2138f	테스트	DONE	테스트2	2026-01-01	2026-01-31	3	1	33	2026-01-11 05:15:43.9	2026-01-14 12:49:48.294
36dff6ad-23df-4fb1-8885-5bbd56079ab1	00000000-0000-0000-0000-000000000001	af3a54f3-797d-4fd4-b40d-5a14a1012f22	테스틋테트	DONE	ㅂㅈㄷㄴㅇㅁㅇㅁㄴㅇ	2026-01-01	2026-01-31	2	1	50	2026-01-14 12:48:12.081	2026-01-14 12:49:52.043
48ffbced-139b-4b1a-a1a0-aa309f857bdb	00000000-0000-0000-0000-000000000001	9edb5989-98f6-474f-b7ab-f1dafda636e9	asd	DONE	qweqwe	2026-01-01	2026-01-31	1	1	100	2026-01-11 06:12:39.244	2026-01-14 12:49:54.431
9194f89a-f3fb-4e5b-a161-0eebdd5f8c83	00000000-0000-0000-0000-000000000001	af3a54f3-797d-4fd4-b40d-5a14a1012f22	충격시험 진도 및 완료 시간 예측	IN_PROGRESS	영업 및 외부 고객사 요청건인 충격시험의 시험 진도, 완료시점 사전 인지를 위한 데이터 수집	2026-01-12	2026-03-31	0	0	0	2026-01-14 13:00:19.99	2026-01-14 13:00:19.99
da05258f-ffee-4c6c-945b-3e1cf12810ba	00000000-0000-0000-0000-000000000001	af3a54f3-797d-4fd4-b40d-5a14a1012f22	ASME(미국 원자력) 메뉴 신규 추가	IN_PROGRESS	ASME(미국 원자력) 별도 문서 관리	2026-01-13	2026-03-31	4	0	0	2026-01-14 13:01:34.759	2026-01-14 13:01:34.759
6f93af00-46b3-45cd-a3a2-5c820146b86a	00000000-0000-0000-0000-000000000001	c6cb07ae-bcee-413c-b495-5c5099884665	검수실적 조회 검색 기능 개선	IN_PROGRESS	실공급사, 검수등급 멀티 조회를 통한 업무 효율성 향상	2025-12-29	2026-01-30	0	0	0	2026-01-14 13:03:10.027	2026-01-14 13:03:10.027
504453d0-93f4-48a5-b765-13a38d650ad2	00000000-0000-0000-0000-000000000001	c6cb07ae-bcee-413c-b495-5c5099884665	고철업체 퇴송 이력 조회 개선	IN_PROGRESS	입고 대비 퇴송,부분반송 비율 가시성 향상	2026-01-05	2026-01-31	1	0	0	2026-01-14 13:08:47.299	2026-01-14 13:08:47.299
0bc1c16a-960e-4838-8ee0-c0507b5d88b8	00000000-0000-0000-0000-000000000001	c6cb07ae-bcee-413c-b495-5c5099884665	안전불이행 관련 퇴송 프로세스 개선	IN_PROGRESS	안전불이행 관련 입고상태 오류 개선	2026-01-14	2026-01-22	1	1	100	2026-01-14 13:09:41.785	2026-01-14 13:09:41.785
66890d27-9500-41c0-8eb8-1811a80481d2	00000000-0000-0000-0000-000000000001	1acadd61-22de-4f72-807c-421f49c2138f	제강 기간별 성분실적 조회 화면 개선	IN_PROGRESS	Ca 값 추가 관련 모니터링 개선	2026-01-13	2026-01-30	1	1	100	2026-01-14 13:10:23.072	2026-01-14 13:10:23.072
3008c439-219e-4ad5-b305-a345338c4c2a	00000000-0000-0000-0000-000000000001	1a3b7b4e-786c-4d0a-b225-745d52cedff7	크레인 프로그램 개선 요청의 건	IN_PROGRESS	네트워크 상 DB연결 단절 시 프로그램 강제종료 방지 기능 개발 	2025-12-23	2026-01-30	0	0	0	2026-01-14 13:11:14.902	2026-01-14 13:11:14.902
770aa3d2-7c71-4907-b352-16b2da5624c5	00000000-0000-0000-0000-000000000001	1a3b7b4e-786c-4d0a-b225-745d52cedff7	재공 프로세스 오류 개선	IN_PROGRESS	재공품중 Erp 폐품 실적 전송시 GI 투입 실적이 없는 현상에 대한 발생 원인 분석 및 전송 방지  	2025-11-11	2026-01-30	1	0	0	2026-01-14 13:12:16.974	2026-01-14 13:12:16.974
951ca2b7-6277-4fe9-9a30-01ad5cd1a656	00000000-0000-0000-0000-000000000001	1a3b7b4e-786c-4d0a-b225-745d52cedff7	미주향 신규 라벨 적용 요청의 건 	IN_PROGRESS	미주향 코일 신규 라벨 용지 적용으로 인천과 수출코일 양식 일원화	2026-01-01	2026-01-31	1	1	100	2026-01-14 13:13:22.693	2026-01-14 13:13:22.693
\.


--
-- Data for Name: task_assignees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_assignees (id, task_id, user_id) FROM stdin;
bb4b0745-fa61-4c55-815d-89b67619d19e	5434a7a8-24c5-40ce-832f-9953caac9ac7	335c9b09-ce76-49a8-b18a-96b638213a45
7670cb2c-8968-4959-8cf1-e7164e8b913e	db76965e-0b8f-4cd9-b460-186d2db5aba9	e9dd149f-6f1d-4a98-82b8-8b6dac68ad4a
584a48b1-0559-4a5f-b6ea-5d03782fcae2	6b9d0429-e824-4271-ab6b-1923047118a5	e9dd149f-6f1d-4a98-82b8-8b6dac68ad4a
329bd1d7-ee63-4384-90c7-6abfe0858d99	49fe7a7b-6300-4264-b2e5-c108b792ebdd	86facd65-2ea0-423d-9d77-0885e739293c
9cbb6bd5-740e-4aaa-b305-a4a3c2e2fdc5	add43041-3a90-4f18-abd3-4aeccdbf8953	86facd65-2ea0-423d-9d77-0885e739293c
24cdd85f-3ee1-4d87-8535-a3863268fd7e	363d4ce0-7c0d-4ab6-bfd6-fcec1fc25079	86facd65-2ea0-423d-9d77-0885e739293c
594ade56-7cf7-4171-8803-33e01e220f8d	133ae5f8-dd03-4e96-9132-8fc8513907c4	86facd65-2ea0-423d-9d77-0885e739293c
bf83eee0-4f75-4949-a106-eb3fb4afb606	26fa5f43-d9ed-4899-ae06-49f9a02d9aa0	fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a
c0218db2-32a2-4031-b63a-d0046fa4bfd5	fb92935f-53e8-451f-b94a-5a6f649ca2ec	fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a
42a8b6c4-b955-47f0-83a3-16e5e7d6bc9c	2b0ad10f-c662-430b-8c6e-a9254381fe90	fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a
483becbc-7838-4bc5-91db-81c687831418	92011faf-3ea2-4717-9e32-51f5f075bb29	fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a
87e7fbf8-2a53-44dd-87fe-a04b5267cba3	59e45ced-960a-4f84-8ecc-1da508315129	17ba60b8-4237-4496-bc19-b71f88edc44f
a34d7f90-caf0-491e-ab41-986a74589fcc	1b8908f1-dc2b-4faf-81a7-bcd2bbc479c3	575d1267-2341-4dd8-a622-787403eb5772
7f1152ff-1e9c-4aa9-83f3-ea0c19ddda80	ed48d4d8-71a3-490f-9c97-87b836fc6bc6	575d1267-2341-4dd8-a622-787403eb5772
a17acc31-59e6-4348-b815-3e36c0f2e0f9	b16245f9-64af-42bf-8ea5-ee0afdef2545	fb1b8e68-e3ed-46b5-a5f1-f43a19594ffb
f9da3898-d239-4c84-94e6-1813a227aa9b	784fcb5d-3a59-4d73-8055-0316efdcf9b7	fb1b8e68-e3ed-46b5-a5f1-f43a19594ffb
ebef900d-de30-4f0e-904f-cb1ed437ea5c	a8269486-4bc0-422c-8994-d67282723faa	aeb33f27-3b22-48a9-81f8-8414be744a76
ea2a4202-72bf-4406-b1a0-9668db664856	e3625ac5-9892-402b-807e-4b44a9897ce3	aeb33f27-3b22-48a9-81f8-8414be744a76
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, weekly_report_id, chain_id, title, purpose, start_date, end_date, total_count, completed_count, progress, this_week_content, next_week_content, display_order, created_at, updated_at, next_completed_count, next_progress, next_total_count, show_next_week_achievement, show_this_week_achievement, issue_id) FROM stdin;
26fa5f43-d9ed-4899-ae06-49f9a02d9aa0	6b00917a-9b8e-478d-ad89-e541ffc813e2	1a3b7b4e-786c-4d0a-b225-745d52cedff7	크레인 프로그램 개선 요청의 건	네트워크 상 DB연결 단절 시 프로그램 강제종료 방지 기능 개발 	2025-12-23	2026-01-30	0	0	0	시스템 적용(01/08)\n		0	2026-01-14 13:11:14.904	2026-01-14 13:11:14.904	0	0	0	t	f	3008c439-219e-4ad5-b305-a345338c4c2a
fb92935f-53e8-451f-b94a-5a6f649ca2ec	6b00917a-9b8e-478d-ad89-e541ffc813e2	1a3b7b4e-786c-4d0a-b225-745d52cedff7	재공 프로세스 오류 개선	재공품중 Erp 폐품 실적 전송시 GI 투입 실적이 없는 현상에 대한 발생 원인 분석 및 전송 방지  	2025-11-11	2026-01-30	1	0	0	추가 오류 분석 및 개선 \n  Erp 실적 누락 케이스 분석\n	추가 오류 분석 및 개선 \n  재공 확정 프로그램 개선 \n	0	2026-01-14 13:12:16.979	2026-01-14 13:12:16.979	0	50	1	t	t	770aa3d2-7c71-4907-b352-16b2da5624c5
2b0ad10f-c662-430b-8c6e-a9254381fe90	6b00917a-9b8e-478d-ad89-e541ffc813e2	1a3b7b4e-786c-4d0a-b225-745d52cedff7	미주향 신규 라벨 적용 요청의 건 	미주향 코일 신규 라벨 용지 적용으로 인천과 수출코일 양식 일원화	2026-01-01	2026-01-31	1	1	100	미주향 라벨 프로그램 수정\n  신규 용지 사이즈에 맞는 항목별 위치 설정\n  강종, 치수 개별항목에서 한 항목으로 수정 (ex: Grade60/D10[3#])\n	현업 테스트 (01/14, 품질팀, CS공장 시험실)\n시스템 적용(01/15)\n	0	2026-01-14 13:13:22.695	2026-01-14 13:13:22.695	1	100	1	f	t	951ca2b7-6277-4fe9-9a30-01ad5cd1a656
92011faf-3ea2-4717-9e32-51f5f075bb29	6b00917a-9b8e-478d-ad89-e541ffc813e2	1a3b7b4e-786c-4d0a-b225-745d52cedff7	형강 라벨 프로그램 개선 요청의 건 	형강 S8 입고 대기실 라벨 프린터기 오류로 인한 개선	2026-01-06	2026-01-09	1	1	100	현 라벨 출력 명령어 전송 방식 변경 \n  CP949 인코딩 -> ASCII 인코딩\n  프린터로 명령어 전송시 로그파일로 기록 처리기능 개발\n  각 명령어 전송후 명령어 버퍼 처리 (버퍼 비움)\n시스템 적용(01/09)\n		0	2026-01-14 13:14:20.819	2026-01-14 13:14:20.819	1	100	1	f	t	5e6c8d5b-a0a1-4b69-ae8b-dd575a94b32f
59e45ced-960a-4f84-8ecc-1da508315129	6b00917a-9b8e-478d-ad89-e541ffc813e2	256fd53f-17f8-4c7b-8200-3406da8e7148	출하취소 반입 시 중량 계산 개선 건	PCS단위 출하 취소 반입 시 중량 계산 오류 개선	2025-12-23	2026-01-16	2	2	100	봉형강제품 반입관리 화면에서 반입 처리 시 제품중량 계산 로직 수정 \n	가동계 반영(01/15)\n	0	2026-01-14 13:15:25.801	2026-01-14 13:15:25.801	2	100	2	f	t	f473f69c-5960-41a1-9bd0-61e4a21ef806
1b8908f1-dc2b-4faf-81a7-bcd2bbc479c3	6b00917a-9b8e-478d-ad89-e541ffc813e2	9edb5989-98f6-474f-b7ab-f1dafda636e9	재고현황 및 작업 실적 조회 화면 개발	재고현황 및 자재별 수불 내역을 파악하기 위해 프로그램 개발	2026-01-09	2026-01-30	2	2	100	적재위치별 재고 현황\n작업 실적 조회\n  프로그램 개발 및 테스트\n  재고 데이터 검증\n	가동계 적용(01/20)\n	0	2026-01-14 13:16:28.27	2026-01-14 13:16:28.27	2	100	2	f	t	317eeafb-4f9e-495c-9233-d73c84df0c1f
5434a7a8-24c5-40ce-832f-9953caac9ac7	2b111cb7-eaeb-4adb-b336-38b440b896e7	206996ae-0336-4485-969d-e23cb2c5a38d	재고 관리 화면 수정	재고관리 편의성 강화	2026-01-01	2026-01-31	1	0	0	- 이번주 실적	- 다음주 계획	0	2026-01-10 11:23:18.384	2026-01-10 11:23:18.384	1	100	1	t	t	\N
ed48d4d8-71a3-490f-9c97-87b836fc6bc6	6b00917a-9b8e-478d-ad89-e541ffc813e2	9edb5989-98f6-474f-b7ab-f1dafda636e9	SSC 처리 실적 조회 프로그램 개선	화면 내에 모재길이, Loss길이, 출하일자 항목 추가하여 실적 Data 정확도 향상 및 관리 강화	2026-01-01	2026-01-31	0	0	0	모재길이, Loss길이, 출하 일자 항목 확인 할 수 있도록 추가\n프로그램 테스트\n	가동계 적용(01/20)\n	0	2026-01-14 13:17:13.176	2026-01-14 13:17:13.176	0	0	0	f	f	7eaa62ab-e633-4a95-a40a-e95659f1b5e1
b16245f9-64af-42bf-8ea5-ee0afdef2545	6b00917a-9b8e-478d-ad89-e541ffc813e2	206996ae-0336-4485-969d-e23cb2c5a38d	SSC 처리 내역 조회 신규 화면 개발	주문 단위 SSC 실적 관리 편의성 강화	2026-01-01	2026-01-31	0	0	0	가동계 적용(01/15)\n		0	2026-01-14 13:33:14.569	2026-01-14 13:33:14.569	0	0	0	f	f	332814a9-681c-46ab-a21e-bc1d3674c77d
784fcb5d-3a59-4d73-8055-0316efdcf9b7	6b00917a-9b8e-478d-ad89-e541ffc813e2	206996ae-0336-4485-969d-e23cb2c5a38d	SSC 납기약속 가부 체크 로직 개선	SSC 납기약속 응답 오류 해결	2026-01-12	2026-01-31	1	1	100	SSC 납기 응답 시 일부 행번만 응답되는 케이스 확인 \nD-Mega Beam 납기 가부 체크 로직 참고, 오류 개선 진행	납기 응답 테스트 진행 	0	2026-01-14 13:34:02.09	2026-01-14 13:34:02.09	1	100	1	f	t	e5c7e0b2-b6e3-4360-9bde-8232afdbedb5
db76965e-0b8f-4cd9-b460-186d2db5aba9	6b00917a-9b8e-478d-ad89-e541ffc813e2	af3a54f3-797d-4fd4-b40d-5a14a1012f22	충격시험 진도 및 완료 시간 예측	영업 및 외부 고객사 요청건인 충격시험의 시험 진도, 완료시점 사전 인지를 위한 데이터 수집	2026-01-12	2026-03-31	0	0	0	시스템 분석 및 설계\n  충격시험 진행 과정 확인\n  설계를 위한 주요 체크 리스트 정의\n	시스템 분석 및 설계\n  시스템 분석 및 화면 설계\n	0	2026-01-14 13:00:19.995	2026-01-14 13:00:19.995	0	0	0	f	f	9194f89a-f3fb-4e5b-a161-0eebdd5f8c83
6b9d0429-e824-4271-ab6b-1923047118a5	6b00917a-9b8e-478d-ad89-e541ffc813e2	af3a54f3-797d-4fd4-b40d-5a14a1012f22	ASME(미국 원자력) 메뉴 신규 추가	ASME(미국 원자력) 별도 문서 관리	2026-01-13	2026-03-31	4	0	0	신규 메뉴 추가\n  매뉴얼, 절차서, 표준서, 자료실\n문서 다운로드 및 출력 방지를 위한 솔루션 도입(StreamDocs PDF뷰어) 검토\n	신규 메뉴 추가\n  매뉴얼, 절차서, 표준서, 자료실\n문서 다운로드 및 출력 방지를 위한 솔루션 도입(StreamDocs PDF뷰어) 검토	0	2026-01-14 13:01:34.761	2026-01-14 13:01:34.761	0	30	4	t	t	da05258f-ffee-4c6c-945b-3e1cf12810ba
49fe7a7b-6300-4264-b2e5-c108b792ebdd	6b00917a-9b8e-478d-ad89-e541ffc813e2	c6cb07ae-bcee-413c-b495-5c5099884665	검수실적 조회 검색 기능 개선	실공급사, 검수등급 멀티 조회를 통한 업무 효율성 향상	2025-12-29	2026-01-30	0	0	0	시스템 적용(01/15)\n		0	2026-01-14 13:03:10.03	2026-01-14 13:03:10.03	0	0	0	f	f	6f93af00-46b3-45cd-a3a2-5c820146b86a
add43041-3a90-4f18-abd3-4aeccdbf8953	6b00917a-9b8e-478d-ad89-e541ffc813e2	c6cb07ae-bcee-413c-b495-5c5099884665	고철업체 퇴송 이력 조회 개선	입고 대비 퇴송,부분반송 비율 가시성 향상	2026-01-05	2026-01-31	1	0	0	데이터 조회 쿼리 개선 진행 중\n  부분반송 및 입고대비 비율 추가\n	데이터 조회 쿼리 개선 및 정합성 테스트  \n시스템 적용(01/22)\n	0	2026-01-14 13:08:47.304	2026-01-14 13:08:47.304	1	100	1	t	t	504453d0-93f4-48a5-b765-13a38d650ad2
363d4ce0-7c0d-4ab6-bfd6-fcec1fc25079	6b00917a-9b8e-478d-ad89-e541ffc813e2	c6cb07ae-bcee-413c-b495-5c5099884665	안전불이행 관련 퇴송 프로세스 개선	안전불이행 관련 입고상태 오류 개선	2026-01-14	2026-01-22	1	1	100	2차 계량 실적 수신 프로시저 개선\n  입고상태 업데이트 부분 삭제 처리\n	시스템 적용(01/20)\n	0	2026-01-14 13:09:41.787	2026-01-14 13:09:41.787	1	100	1	f	t	0bc1c16a-960e-4838-8ee0-c0507b5d88b8
133ae5f8-dd03-4e96-9132-8fc8513907c4	6b00917a-9b8e-478d-ad89-e541ffc813e2	1acadd61-22de-4f72-807c-421f49c2138f	제강 기간별 성분실적 조회 화면 개선	Ca 값 추가 관련 모니터링 개선	2026-01-13	2026-01-30	1	1	100	Ca값 추가 관련 화면 및 쿼리 개선\n시스템 적용(01/15)\n		0	2026-01-14 13:10:23.077	2026-01-14 13:10:23.077	1	100	1	f	t	66890d27-9500-41c0-8eb8-1811a80481d2
a8269486-4bc0-422c-8994-d67282723faa	6b00917a-9b8e-478d-ad89-e541ffc813e2	69f7450c-4754-419e-abaf-97f3011feeda	KOLAS 성과대비표 발행 로직 개선	KOLAS 성적서 승인 완료 시 성과대비표 자동 발행 로직을 적용하여 업무 효율 및 사용자 편의성 향상	2025-12-31	2026-01-30	0	0	0	가동계 적용(1/15)		0	2026-01-14 13:34:59.927	2026-01-14 13:34:59.927	0	0	0	f	f	c718c963-48c7-4eac-b5a9-4066539cf817
e3625ac5-9892-402b-807e-4b44a9897ce3	6b00917a-9b8e-478d-ad89-e541ffc813e2	69f7450c-4754-419e-abaf-97f3011feeda	사업장별 ASTM 양식 분리	포항공장 검사증명서 간 동일 양식 유지	2026-01-08	2026-02-28	2	0	0	AS-IS 리포트 구조 분석\n	AS-IS 리포트 구조 분석\n포항/인천 공통 양식 분리 시 영향도 분석\n기존 프로시저 및 함수 재사용 가능 여부 검증\n	0	2026-01-14 13:35:55.265	2026-01-14 13:35:55.265	0	0	2	t	t	b41d18ee-c20d-4329-b17e-d7f379450fd2
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, location, total_members, created_at, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	포항운영팀	포항	8	2026-01-08 09:48:18.085	2026-01-08 09:48:18.085
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, role, team_id, created_at, updated_at, "position", display_order) FROM stdin;
17ba60b8-4237-4496-bc19-b71f88edc44f	ahreum.cho@dongkuk.com	$2b$10$L7qianrpM27sOc/JTeXaBeTyRl5lGuNDdiFXcer0Y2lhbM7fsgiBG	조아름	USER	00000000-0000-0000-0000-000000000001	2026-01-11 06:02:03.208	2026-01-14 12:27:53.376	MANAGER	4
86facd65-2ea0-423d-9d77-0885e739293c	seongho.hong@dongkuk.com	$2b$10$g70F8hjbw1lM4NYDUQ/NoudzpfsDNlWDkU2VBxrQjxuBqsLz9/GzK	홍성호	USER	00000000-0000-0000-0000-000000000001	2026-01-11 06:02:56.533	2026-01-14 12:27:53.376	STAFF	2
e9dd149f-6f1d-4a98-82b8-8b6dac68ad4a	sunmin.hong@dongkuk.com	$2b$10$MHrdbcBDH6zt9RFatJXbOObNICPGnyVcqMJ8EMlKYlZ5AKxk46CDK	홍순민	USER	00000000-0000-0000-0000-000000000001	2026-01-10 12:13:34.169	2026-01-14 12:27:53.376	STAFF	1
fe4ba50f-7dc0-42e4-9541-536d0b6e0d9a	yong.youn@dongkuk.com	$2b$10$x0XrKRPjhVQoMZrYj102Ou7tMBrn5EJcti/B7RcI12Zs/ptwNDeS2	윤영	USER	00000000-0000-0000-0000-000000000001	2026-01-11 06:01:15.405	2026-01-14 12:27:53.376	MANAGER	3
575d1267-2341-4dd8-a622-787403eb5772	changgeun.lee@dongkuk.com	$2b$10$KgKtQBCDq6EerxXM7g411uHQTORi3WOBgfJ/heI97eLRqwlf0LwVW	이창근	USER	00000000-0000-0000-0000-000000000001	2026-01-08 09:48:18.337	2026-01-14 12:27:53.376	MANAGER	5
fb1b8e68-e3ed-46b5-a5f1-f43a19594ffb	kyungbong.lee@dongkuk.com	$2b$10$uduqPX.m6/IY3Kkrli/8GOs8IfCCop3v2LkJZeYgXF2fFDlC9.66y	이경봉	USER	00000000-0000-0000-0000-000000000001	2026-01-08 09:48:18.252	2026-01-14 12:27:53.377	STAFF	6
aeb33f27-3b22-48a9-81f8-8414be744a76	juhyeon1.kim@dongkuk.com	$2b$10$TdELqNCWO52qY8y/oqkfz.iDfeDHzfucVt7MPCm9xyr/4FLfTSuDe	김주현	USER	00000000-0000-0000-0000-000000000001	2026-01-11 06:02:30.372	2026-01-14 12:27:53.397	STAFF	7
1f979db3-aed5-48af-a952-c3824fef3012	pyoungjin.son@dongkuk.com	$2b$10$FfySFQ3YVFX5m/9AXzEAHunTJ.n9ExpRalmqxNE8umQDZCt.TSrn.	손병진	ADMIN	00000000-0000-0000-0000-000000000001	2026-01-08 09:48:18.294	2026-01-14 12:27:53.404	TEAM_LEAD	8
335c9b09-ce76-49a8-b18a-96b638213a45	admin@dongkuk.com	$2b$10$cGCM1oiMFWMUO3NFNiYWUukVo8CLJB5BY7eDuXUPGng537.g7YECG	관리자	ADMIN	00000000-0000-0000-0000-000000000001	2026-01-08 09:48:18.207	2026-01-14 12:27:53.405	TEAM_LEAD	9
\.


--
-- Data for Name: weekly_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weekly_reports (id, team_id, year, week_number, week_start, week_end, status, created_at, updated_at) FROM stdin;
6b00917a-9b8e-478d-ad89-e541ffc813e2	00000000-0000-0000-0000-000000000001	2026	3	2026-01-12	2026-01-16	DRAFT	2026-01-10 11:31:17.471	2026-01-10 11:31:17.471
2b111cb7-eaeb-4adb-b336-38b440b896e7	00000000-0000-0000-0000-000000000001	2026	2	2026-01-05	2026-01-09	COMPLETED	2026-01-10 11:11:59.66	2026-01-11 02:31:56.695
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: attendance_types attendance_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance_types
    ADD CONSTRAINT attendance_types_pkey PRIMARY KEY (id);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: chain_assignees chain_assignees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chain_assignees
    ADD CONSTRAINT chain_assignees_pkey PRIMARY KEY (id);


--
-- Name: chains chains_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chains
    ADD CONSTRAINT chains_pkey PRIMARY KEY (id);


--
-- Name: issue_assignees issue_assignees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_assignees
    ADD CONSTRAINT issue_assignees_pkey PRIMARY KEY (id);


--
-- Name: issues issues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_pkey PRIMARY KEY (id);


--
-- Name: task_assignees task_assignees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weekly_reports weekly_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT weekly_reports_pkey PRIMARY KEY (id);


--
-- Name: attendance_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX attendance_types_code_key ON public.attendance_types USING btree (code);


--
-- Name: chain_assignees_chain_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX chain_assignees_chain_id_user_id_key ON public.chain_assignees USING btree (chain_id, user_id);


--
-- Name: chains_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX chains_code_key ON public.chains USING btree (code);


--
-- Name: issue_assignees_issue_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX issue_assignees_issue_id_user_id_key ON public.issue_assignees USING btree (issue_id, user_id);


--
-- Name: task_assignees_task_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX task_assignees_task_id_user_id_key ON public.task_assignees USING btree (task_id, user_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: weekly_reports_team_id_year_week_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX weekly_reports_team_id_year_week_number_key ON public.weekly_reports USING btree (team_id, year, week_number);


--
-- Name: attendances attendances_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.attendance_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attendances attendances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: chain_assignees chain_assignees_chain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chain_assignees
    ADD CONSTRAINT chain_assignees_chain_id_fkey FOREIGN KEY (chain_id) REFERENCES public.chains(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chain_assignees chain_assignees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chain_assignees
    ADD CONSTRAINT chain_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issue_assignees issue_assignees_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_assignees
    ADD CONSTRAINT issue_assignees_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue_assignees issue_assignees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_assignees
    ADD CONSTRAINT issue_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issues issues_chain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_chain_id_fkey FOREIGN KEY (chain_id) REFERENCES public.chains(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issues issues_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: task_assignees task_assignees_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_assignees task_assignees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignees
    ADD CONSTRAINT task_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_chain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_chain_id_fkey FOREIGN KEY (chain_id) REFERENCES public.chains(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_weekly_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_weekly_report_id_fkey FOREIGN KEY (weekly_report_id) REFERENCES public.weekly_reports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: weekly_reports weekly_reports_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT weekly_reports_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

