# Car Dealership Inventory System

A full-stack car dealership inventory management system built with Node.js/TypeScript (Express), PostgreSQL (via Prisma), and React (with Tailwind CSS). The project follows Test-Driven Development (TDD) principles with a clear Red-Green-Refactor commit history.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Screenshots](#screenshots)
- [My AI Usage](#my-ai-usage)

---

## Project Overview

CarDeal is a role-based inventory management platform for a car dealership. Regular users can browse and purchase vehicles. Admin users can add, update, delete, and restock vehicles. All endpoints (except register/login) are protected with JWT authentication.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Node.js, TypeScript, Express 5      |
| Database  | PostgreSQL 17 (via Docker)          |
| ORM       | Prisma 7                            |
| Auth      | JWT (jsonwebtoken), bcrypt          |
| Testing   | Vitest, Supertest                   |
| Frontend  | React 19, TypeScript, Vite 8        |
| Styling   | Tailwind CSS 4                      |
| HTTP      | Axios                               |

---

## Features

### Backend
- User registration and login with hashed passwords
- JWT-based authentication on all protected routes
- Role-based access control (USER / ADMIN)
- Full vehicle CRUD with validation
- Search/filter by make, model, category, price range
- Pagination support
- Purchase endpoint (decrements stock, rejects if out of stock)
- Restock endpoint (admin only)

### Frontend
- Register and Login pages
- Protected Dashboard (redirects to login if unauthenticated)
- Browse all vehicles with search by make and category filter
- Purchase button (disabled when out of stock)
- Admin panel: Add, Edit, Delete vehicles via modals
- Admin restock modal

---

## Project Structure

```
car-dealership-inventory/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/         # Prisma client
│   │   ├── controllers/    # auth, vehicle
│   │   ├── middleware/     # auth, admin
│   │   ├── routes/         # auth, vehicle
│   │   ├── services/       # auth, vehicle
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── auth/           # register, login
│   │   └── vehicles/       # create, get, filter, update, delete, purchase, restock
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # Login, Register, Dashboard
│   │   ├── services/       # axios api instance
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── docker-compose.yml
├── README.md
└── PROMPTS.md
```

---

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd car-dealership-inventory
```

### 2. Start the database

```bash
docker-compose up -d
```

This starts PostgreSQL on port `5433`.

### 3. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (already present):
```
DATABASE_URL="postgresql://dealership:dealership_password@localhost:5433/car_dealership"
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_12345
```

Run migrations and generate Prisma client:
```bash
npx prisma migrate deploy
npx prisma generate
```

Start the backend:
```bash
npm run dev
```

Backend runs on `http://localhost:3000`.

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 5. Create an Admin user

After registering a user, update their role directly in the database:

```bash
docker exec -it car-dealership-postgres psql -U dealership -d car_dealership
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## API Endpoints

### Auth

| Method | Endpoint              | Auth | Description           |
|--------|-----------------------|------|-----------------------|
| POST   | /api/auth/register    | No   | Register a new user   |
| POST   | /api/auth/login       | No   | Login and get JWT     |
| GET    | /api/auth/me          | Yes  | Get current user info |

### Vehicles

| Method | Endpoint                     | Auth  | Role  | Description                  |
|--------|------------------------------|-------|-------|------------------------------|
| GET    | /api/vehicles                | Yes   | Any   | List vehicles (with filters) |
| GET    | /api/vehicles/search         | Yes   | Any   | Search by make/model/category/price |
| GET    | /api/vehicles/:id            | Yes   | Any   | Get a vehicle by ID          |
| POST   | /api/vehicles                | Yes   | Admin | Create a vehicle             |
| PUT    | /api/vehicles/:id            | Yes   | Admin | Update a vehicle             |
| DELETE | /api/vehicles/:id            | Yes   | Admin | Delete a vehicle             |
| POST   | /api/vehicles/:id/purchase   | Yes   | Any   | Purchase (decrements stock)  |
| POST   | /api/vehicles/:id/restock    | Yes   | Admin | Restock (increments stock)   |

### Query Parameters (GET /api/vehicles and /api/vehicles/search)

| Param     | Type   | Description                      |
|-----------|--------|----------------------------------|
| make      | string | Filter by make (case-insensitive)|
| model     | string | Filter by model                  |
| category  | string | Filter by category               |
| minPrice  | number | Minimum price                    |
| maxPrice  | number | Maximum price                    |
| page      | number | Page number (default: 1)         |
| limit     | number | Items per page (default: 10)     |

---

## Running Tests

```bash
cd backend
npm test
```

Tests use a real PostgreSQL database (the same Docker instance). Each test suite cleans up after itself using `beforeAll`/`afterAll` hooks.

Test files:
- `tests/auth/register.test.ts`
- `tests/auth/login.test.ts`
- `tests/vehicles/create.test.ts`
- `tests/vehicles/get.test.ts`
- `tests/vehicles/filter.test.ts`
- `tests/vehicles/update.test.ts`
- `tests/vehicles/delete.test.ts`
- `tests/vehicles/purchase.test.ts`
- `tests/vehicles/restock.test.ts`

---

## Screenshots

> Add screenshots of the running application here.

**Login Page**
![Login](screenshots/login.png)

**Dashboard - User View**
![Dashboard User](screenshots/dashboard-user.png)

**Dashboard - Admin View**
![Dashboard Admin](screenshots/dashboard-admin.png)

**Add Vehicle Modal**
![Add Vehicle](screenshots/add-vehicle.png)

---

## My AI Usage

### Tools Used

- **Kiro (AI coding assistant)** — used throughout the project for scaffolding, debugging, and code review.

### How I Used AI

| Task | How AI Helped |
|------|---------------|
| Project scaffolding | Generated the initial folder structure and placeholder files |
| Prisma schema | Helped design the `User` and `Vehicle` models with correct field types |
| Auth controller/service | Generated boilerplate for register/login with bcrypt and JWT; manually added validation logic |
| Vehicle service | Generated CRUD and purchase/restock logic; manually fixed the price range filter bug where `maxPrice` was overwriting `minPrice` |
| Test files | Generated test case structure for all vehicle and auth tests; reviewed and adjusted assertions |
| Bug fixes | Identified missing CORS config, missing `DATABASE_URL` in Prisma schema, and port mismatch between frontend and backend |
| Frontend | Generated Login, Register, and Dashboard components; added auth guard and admin modal UI manually |
| `prisma.$disconnect()` | Diagnosed why `vitest run` was hanging and suggested the `afterAll` fix |

### Reflection

Using AI significantly accelerated the initial scaffolding and boilerplate work. However, several real bugs required manual investigation — the price filter overwrite, the missing `url` in the Prisma datasource, and the CORS configuration. AI was most useful as a pair programmer that handles repetitive patterns, while the actual debugging and architectural decisions remained my responsibility.

All AI-assisted commits are tagged with `Co-authored-by: Kiro <kiro@users.noreply.github.com>` in the commit history.
