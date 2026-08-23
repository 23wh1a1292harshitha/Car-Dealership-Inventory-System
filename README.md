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
- Landing page with Admin / Customer role selection
- Register and Login pages (role-aware)
- Protected Dashboard (redirects unauthenticated users to home)
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
│   │   ├── schema.prisma
│   │   └── seed.ts
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
│   │   ├── pages/          # Home, Login, Register, Dashboard
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
git clone https://github.com/23wh1a1292harshitha/Car-Dealership-Inventory-System.git
cd Car-Dealership-Inventory-System/car-dealership-inventory
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
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Backend runs on `http://localhost:3000`.

### 4. Seed the database (demo users + vehicles)

```bash
npm run seed
```

This creates:
- **Admin:** `admin@cardeal.com` / `Admin@123`
- **Customer:** `user@cardeal.com` / `User@123`
- 12 sample vehicles across Sedan, SUV, Hatchback, and Luxury categories

### 5. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## Usage

Open `http://localhost:5173` — you'll see the landing page with two role cards:

| Role | Email | Password |
|------|-------|----------|
| 🛠️ Admin | admin@cardeal.com | Admin@123 |
| 🚗 Customer | user@cardeal.com | User@123 |

**Admin** can: Add, Edit, Delete, and Restock vehicles  
**Customer** can: Browse, Search, Filter, and Purchase vehicles

---

## API Endpoints

### Auth

| Method | Endpoint           | Auth | Description         |
|--------|--------------------|------|---------------------|
| POST   | /api/auth/register | No   | Register a new user |
| POST   | /api/auth/login    | No   | Login and get JWT   |
| GET    | /api/auth/me       | Yes  | Get current user    |

### Vehicles

| Method | Endpoint                   | Auth | Role  | Description                        |
|--------|----------------------------|------|-------|------------------------------------|
| GET    | /api/vehicles              | Yes  | Any   | List vehicles (filters + pagination)|
| GET    | /api/vehicles/search       | Yes  | Any   | Search by make/model/category/price |
| GET    | /api/vehicles/:id          | Yes  | Any   | Get vehicle by ID                  |
| POST   | /api/vehicles              | Yes  | Admin | Create a vehicle                   |
| PUT    | /api/vehicles/:id          | Yes  | Admin | Update a vehicle                   |
| DELETE | /api/vehicles/:id          | Yes  | Admin | Delete a vehicle                   |
| POST   | /api/vehicles/:id/purchase | Yes  | Any   | Purchase (decrements stock)        |
| POST   | /api/vehicles/:id/restock  | Yes  | Admin | Restock (increments stock)         |

### Query Parameters

| Param    | Type   | Description                       |
|----------|--------|-----------------------------------|
| make     | string | Filter by make (case-insensitive) |
| model    | string | Filter by model                   |
| category | string | Filter by category                |
| minPrice | number | Minimum price                     |
| maxPrice | number | Maximum price                     |
| page     | number | Page number (default: 1)          |
| limit    | number | Items per page (default: 10)      |

---

## Running Tests

```bash
cd backend
npm test
```

Each test suite creates and cleans up its own data. Tests run against the real PostgreSQL database.

**Test files:**
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

> Screenshots of the running application.

**Landing Page — Role Selection**

**Login Page (Admin)**

**Customer Dashboard — Browse & Purchase**

**Admin Dashboard — Manage Inventory**

**Add Vehicle Modal**

*(Add screenshots to a `screenshots/` folder and update the paths above)*

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
| Frontend | Generated Login, Register, Dashboard, and Home components; added auth guard and admin modal UI |
| Vitest hang fix | Diagnosed open Prisma connection after tests; added `afterAll(() => prisma.$disconnect())` |
| Seed script | Generated seed data with admin user, regular user, and 12 sample vehicles |

### Reflection

Using AI significantly accelerated the initial scaffolding and boilerplate work. However, several real bugs required manual investigation — the price filter overwrite, the missing `url` in the Prisma datasource, and the CORS configuration. AI was most useful as a pair programmer that handles repetitive patterns, while the actual debugging and architectural decisions remained my responsibility.

All AI-assisted commits are tagged with `Co-authored-by: Kiro <kiro@users.noreply.github.com>` in the commit history.
