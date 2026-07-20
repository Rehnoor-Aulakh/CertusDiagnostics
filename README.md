<div align="center">
  <h1>Certus Diagnostics 🏥</h1>
  
  **A modern, full-stack diagnostics platform for patients and clinic administrators.**
  
  *Bridging the gap between clinical operations and patient experience through seamless test management, automated report processing, and secure communication.*

  ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-6%20%26%207-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

---

## 🌟 Key Features

### 🛡️ Security & Authentication
- **Google OAuth Integration**: Frictionless sign-in for both patients and administrators.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `ROLE_PATIENT` and `ROLE_ADMIN`, enforced via secure JWTs.
- **Environment-Driven Configuration**: Zero hardcoded secrets. All sensitive data (database credentials, OAuth Client IDs, Super Admin emails, SMTP keys) are securely injected via `.env` files.

### 👨‍⚕️ Admin Operations (Certus-Admin)
- **Comprehensive Dashboard**: Real-time metrics, interactive charts (Chart.js), and recent test activity monitoring.
- **Automated Report Ingestion**: Upload PDF diagnostic reports that the backend automatically parses and persists.
- **Smart Abnormal Detection**: Intelligent backend parsing correctly interprets standard reference ranges and automatically highlights abnormal patient results.

### 🤒 Patient Experience (Certus-Client)
- **Patient Portal**: Secure access to personal health records and diagnostic reports.
- **Secure Report Downloads**: Authorized PDF downloads restricted to the authenticated patient or admins.
- **Intuitive UI**: Smooth animations with Framer Motion and a responsive, beautiful layout powered by Tailwind CSS.

### ✉️ Notifications
- **Automated Email Alerts**: Super administrators are instantly notified of critical events and access requests via Spring Mail.

---

## 🏗️ Architecture & Tech Stack

Certus Diagnostics is organized as a three-application monorepo:

| Application | Purpose | Local Address | Tech Stack |
| :--- | :--- | :--- | :--- |
| **`Certus-Client`** | Patient-facing web application | `http://localhost:5173` | React 19, Vite 7, Tailwind CSS, Framer Motion |
| **`Certus-Admin`** | Internal clinic operations dashboard | `http://localhost:5174` | React 19, Vite 6, Tailwind CSS, Chart.js |
| **`Certus-Backend`** | Secured RESTful API | `http://localhost:8080` | Java 17, Spring Boot 4.1, Spring Data JPA, JWT, OAuth2 |

*Note: The `certusServer` directory contains a legacy PHP implementation maintained for migration reference.*

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v20+) & **npm**
- **Java** (v17+) & **Maven**
- **PostgreSQL**
- A **Google OAuth Web Client ID**

### 2. Environment Configuration
Environment files are deliberately ignored by Git for security. Copy the templates and fill in your local values:

```sh
# Setup Client ENV
cp Certus-Client/.env.example Certus-Client/.env

# Setup Admin ENV
cp Certus-Admin/.env.example Certus-Admin/.env

# Setup Backend ENV
cp Certus-Backend/.env.example Certus-Backend/.env
```

**Critical Backend Environment Variables (`Certus-Backend/.env`)**:
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` - PostgreSQL connection.
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` - SMTP mail server config.
- `APP_JWT_SECRET` - Base64-encoded JWT signing key. *(Generate via `openssl rand -base64 32`)*
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID.
- `SUPER_ADMIN_EMAIL` - Email address for admin notifications.

### 3. Run the Backend API
```sh
cd Certus-Backend
./mvnw spring-boot:run
```
*API runs on `http://localhost:8080`. Ensure PostgreSQL is running before starting.*

### 4. Run the Patient Application
```sh
cd Certus-Client
npm install
npm run dev
```
*Accessible at `http://localhost:5173`.*

### 5. Run the Admin Application
```sh
cd Certus-Admin
npm install
npm run dev -- --port 5174
```
*Accessible at `http://localhost:5174`.*

---

## 🔒 Security Posture
- **Never commit `.env` files.** 
- All external dependencies and endpoints validate the `Authorization: Bearer <token>` header.
- Cross-Origin Resource Sharing (CORS) strictly permits only `localhost:5173` and `localhost:5174` during development.
- Diagnostic report downloads check the JWT identity against the requested document's ownership to prevent direct-object reference (IDOR) vulnerabilities.

---

## 📜 License
Private project for Certus Diagnostics. All rights reserved.
