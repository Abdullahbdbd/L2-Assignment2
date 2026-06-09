# 🚼 DevPulse – Internal Tech Issue & Feature Tracker

DevPulse is a collaborative platform designed for software teams to report bugs, suggest new features, and manage issue workflows efficiently. The system provides secure authentication, role-based authorization, and issue management capabilities for contributors and maintainers.

---

## 🌐 Live URL

https://your-live-url.com

---

## ✨ Features

- User registration and login with JWT authentication
- Secure password hashing using bcrypt
- Role-based access control (Contributor & Maintainer)
- Create bug reports and feature requests
- Retrieve all issues with filtering and sorting
- Retrieve a single issue with reporter information
- Update issues based on role permissions
- Delete issues (Maintainer only)
- Raw SQL queries using PostgreSQL
- No ORM, Query Builder, or SQL JOIN used

---

## 🛠️ Technology Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- pg
- bcrypt
- jsonwebtoken
- dotenv
- tsx

---

## 📦 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/devpulse.git
cd devpulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env` file in the root directory and add:

```env
PORT=5000
DATABASE_URL=your_database_connection_url
JWT_SECRET=your_jwt_secret
```

### 4. Run the project

Development mode:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

Run production build:

```bash
npm start
```

---

## 📡 API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/signup
```

#### Login User

```http
POST /api/auth/login
```

---

### Issues

#### Create Issue

```http
POST /api/issues
```

Authorization Required

#### Get All Issues

```http
GET /api/issues
```

Query Parameters:

| Parameter | Values |
|------------|------------|
| sort | newest, oldest |
| type | bug, feature_request |
| status | open, in_progress, resolved |

Example:

```http
GET /api/issues?sort=newest&type=bug&status=open
```

#### Get Single Issue

```http
GET /api/issues/:id
```

#### Update Issue

```http
PATCH /api/issues/:id
```

Authorization Required

#### Delete Issue

```http
DELETE /api/issues/:id
```

Maintainer Only

---

## 🗄️ Database Schema Summary

### Users Table

| Field | Type |
|---------|---------|
| id | Serial Primary Key |
| name | VARCHAR |
| email | VARCHAR (Unique) |
| password | VARCHAR |
| role | contributor / maintainer |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

### Issues Table

| Field | Type |
|---------|---------|
| id | Serial Primary Key |
| title | VARCHAR(150) |
| description | TEXT |
| type | bug / feature_request |
| status | open / in_progress / resolved |
| reporter_id | INTEGER |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## 🔐 Authentication Flow

1. User registers or logs in.
2. Server validates credentials.
3. JWT token is generated.
4. Client sends token in request headers.

Example:

```http
Authorization: Bearer <JWT_TOKEN>
```

5. Server verifies token before processing protected routes.

---

## 👥 User Roles

### Contributor

- Register and login
- Create issues
- View issues
- Update own issues when status is `open`

### Maintainer

- All contributor permissions
- Update any issue
- Delete any issue
- Manage issue workflow status

---

## 📁 Project Structure

```text
src
│
├── app
│   ├── modules
│   │   ├── auth
│   │   └── issues
│   │
│   ├── middlewares
│   ├── config
│   ├── interfaces
│   └── utils
│
├── app.ts
└── server.ts
```

---

## ⚠️ Important Notes

- Raw SQL queries are used via `pool.query()`
- No ORM is used
- No Query Builder is used
- No SQL JOIN is used
- Passwords are hashed before storing
- JWT protects private routes

---

## 👨‍💻 Author

Abdullah Mohammad

---

## 📄 License

This project is created for educational and assignment purposes.