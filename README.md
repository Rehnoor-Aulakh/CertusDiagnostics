# Certus Diagnostics

> A modern diagnostics platform for patients and clinic administrators—covering Google sign-in, patient records, test activity, reports, and operational dashboards.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6%20%26%207-646CFF?logo=vite&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)

## At a glance

Certus Diagnostics is a three-application workspace:

| Application | Purpose | Local address |
| --- | --- | --- |
| `Certus-Client` | Patient-facing website and portal | `http://localhost:5173` |
| `Certus-Admin` | Internal operations dashboard | `http://localhost:5174` |
| `Certus-Backend` | Secured REST API | `http://localhost:8080` |

## Highlights

- Google OAuth sign-in for patients and administrators
- Role-aware JWT authentication with separate patient and admin access
- Admin dashboard metrics, recent test activity, and reporting workflow
- Patient profiles, test booking, reports, and contact experience
- PostgreSQL persistence through Spring Data JPA
- Email support for administrative approval and notifications
- Environment-based configuration—no database, mail, or JWT credentials in source code

## Tech stack

| Layer | Technologies |
| --- | --- |
| Patient app | React 19, Vite 7, React Router, Tailwind CSS, Framer Motion, Firebase |
| Admin app | React 19, Vite 6, React Router, Tailwind CSS, Chart.js |
| API | Java 17, Spring Boot 4.1, Spring Security, Spring Data JPA, Maven |
| Data & security | PostgreSQL, JWT (`jjwt`), Google OAuth |
| Communication | Spring Mail |

## Prerequisites

- Node.js 20+ and npm
- Java 17+
- PostgreSQL
- A Google OAuth web client ID

## Quick start

### 1. Configure local environment files

Environment files are deliberately ignored by Git. Copy each template and fill in the values for your machine:

```sh
cp Certus-Client/.env.example Certus-Client/.env
cp Certus-Admin/.env.example Certus-Admin/.env
cp Certus-Backend/.env.example Certus-Backend/.env
```

Frontend `VITE_*` values are public configuration that is included in the browser bundle. Do **not** put passwords, private keys, database credentials, or API secrets in frontend `.env` files.

The backend needs these private values in `Certus-Backend/.env`:

| Variable | Purpose |
| --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL connection |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` | SMTP configuration |
| `APP_JWT_SECRET` | Base64-encoded JWT signing key |

Generate a secure signing key with:

```sh
openssl rand -base64 32
```

### 2. Run the backend

```sh
cd Certus-Backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`. Confirm PostgreSQL is running and that the database referenced by `DB_URL` exists before starting the app.

### 3. Run the patient application

In a second terminal:

```sh
cd Certus-Client
npm install
npm run dev
```

### 4. Run the admin application

In a third terminal:

```sh
cd Certus-Admin
npm install
npm run dev -- --port 5174
```

The backend CORS policy permits the patient app on port `5173` and the admin app on port `5174`.

## Useful commands

| Workspace | Development | Production build | Lint |
| --- | --- | --- | --- |
| Client | `npm run dev` | `npm run build` | `npm run lint` |
| Admin | `npm run dev -- --port 5174` | `npm run build` | `npm run lint` |
| Backend | `./mvnw spring-boot:run` | `./mvnw package` | `./mvnw test` |

## Project layout

```text
Certus-Diagnostics-main/
├── Certus-Client/      # Patient-facing React application
├── Certus-Admin/       # Internal React admin dashboard
├── Certus-Backend/     # Spring Boot REST API
└── certusServer/       # Legacy PHP implementation and migration reference
```

## API and authentication

The Spring Boot API is served beneath `/api/v1`.

- `/api/v1/auth/**` — sign-in, Google login, and account flows
- `/api/v1/admin/**` — admin-only endpoints, including `/admin/dashboard`
- `/api/v1/patient/**` — reserved for patient-only protected endpoints

The frontend receives a JWT after successful authentication and sends it as `Authorization: Bearer <token>` for protected requests. The backend verifies both the token and role before granting access.

## Security notes

- Keep `.env` files local. They are ignored by Git; `.env.example` files are safe templates.
- Use your deployment platform's protected environment-variable settings for production credentials.
- Rotate any credential that was ever committed to Git, even if it has since been removed.
- GitHub Actions secrets are suitable for deployment workflows; they must never be used for browser-only secrets because frontend build variables are visible to site visitors.

## License

Private project for Certus Diagnostics.
