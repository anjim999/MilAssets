# ⚔️ MilAssets – Military Asset Management System

![Status](https://img.shields.io/badge/Status-Active-success)
![NodeJS](https://img.shields.io/badge/Backend-Node.js_&_Express-339933?logo=nodedotjs)
![React](https://img.shields.io/badge/Frontend-React_&_Vite-61DAFB?logo=react)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)

MilAssets is a specialized, secure, high-performance web application designed to help military commanders and logistics personnel track, monitor, and audit the movement of critical assets (vehicles, weapons, ammunition, gear) across multiple bases in real-time.

---

## 🔥 Key Features

- **🛡️ Multi-Tier Role-Based Access Control (RBAC):**
  - **Admins:** Full visibility and control across all bases.
  - **Base Commanders:** Can oversee assets, approve transfers, and log expenditures only for their assigned base.
  - **Logistics Officers:** Can record asset purchases and movements only within their scope.
- **📊 Real-Time Analytics Dashboard:**
  - Track KPIs like *Opening/Closing Balances*, *Purchases*, *Net Movement*, and *Expenditures*.
  - View dynamic bar charts mapping asset distribution and movement history.
- **🔄 Secure Asset Transfers:** Strict validations prevent illogical transfers (e.g., transferring assets to the same base) and maintain an immutable ledger.
- **📝 Automatic Audit Logging:** Every data-mutating action is silently intercepted by backend middleware and logged, creating a forensic trail (Who, What, When).
- **🎨 Premium Dark UI:** Built with raw CSS, featuring glassmorphism, fluid animations, and a sleek, immersive dark mode aesthetic.

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Recharts (for Dashboard visualisations)
- React Router DOM
- Custom CSS (Glassmorphism & animations)

**Backend:**
- Node.js + Express
- SQLite (via `better-sqlite3` for synchronous speed & WAL mode)
- JWT (JSON Web Tokens) for Stateless Authentication

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Installation

Clone the repository and install dependencies for both ends:

```bash
# Clone the repo
git clone https://github.com/anjim999/MilAssets.git
cd MilAssets

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

Inside the `backend/` directory, create a `.env` file:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_military_key_2026
```
*(Note: A predefined `.env` structure is already expected by the app).*

### 3. Initialize & Seed the Database

Populate the SQLite database with bases, user accounts, equipment, and historical movements:

```bash
cd backend
npm run seed  # Generates database.sqlite and populates data
```

### 4. Run the Application

Start the backend API server:
```bash
cd backend
npm start  # Runs on http://localhost:5000
```

Start the frontend development server:
```bash
cd frontend
npm run dev  # Runs on http://localhost:5173
```

---

## 🔑 Demo Login Credentials

Use the following accounts to explore different RBAC boundaries. The passwords for all demo accounts are as indicated below:

| Role | Username | Password | Base Access |
|------|----------|----------|-------------|
| **Admin** | `admin` | `admin123` | ALL BASES |
| **Commander** | `commander_alpha` | `cmd123` | Alpha Base Only |
| **Commander** | `commander_bravo` | `cmd123` | Bravo Base Only |
| **Logistics** | `logistics_alpha` | `log123` | Alpha Base Only |

---

## 📂 Architecture Overview

The system strictly adheres to SOC (Separation of Concerns).

```text
MilAssets/
├── backend/
│   ├── config/          # DB configs
│   ├── controllers/     # Req/Res handlers
│   ├── db/              # Schema and seed scripts
│   ├── middleware/      # JWT, RBAC, and Audit tracking
│   ├── routes/          # Express Routers
│   ├── services/        # Core BL (Business Logic)
│   └── app.js           # App scaffolding
└── frontend/
    ├── src/
    │   ├── api/         # Axios interceptors
    │   ├── components/  # Navbars, Modals, Wrappers
    │   ├── context/     # Global state (AuthContext)
    │   └── pages/       # Dashboard, Purchases, Transfers
    └── index.html       
```

---

## 🔒 Security Practices Highlight
- **No IDOR Constraints:** `rbac` middleware automatically appends the base scope limitation natively in SQL queries based on the JWT signature.
- **WAL Mode Enablement:** The SQLite configuration forces WAL mode to prevent locking contentions during concurrent reads/writes between Logistics and Command.
- **Environment Isolation:** Secrets are isolated and dynamically injected contextually.

> Built for strict assignment criteria, delivering high production value within constraint-focused limits.
