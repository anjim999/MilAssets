# MilAssets - Military Asset Management System
## Project Documentation

### 1. Project Overview
**Description:** MilAssets is a robust, centralized web application engineered exclusively for military commanders and logistics personnel. It facilitates the real-time tracking, management, and auditing of critical assets (vehicles, weapons, ammunition, gear) across multiple bases.
**Assumptions:**
- Personnel have predefined roles assigned at account creation, managed externally by high command.
- An asset assigned to personnel must be recorded as such, and "consumed" items (like ammo) are tracked via Expenditures instead of Transfers.
- A physical network exists to handle the physical transfers initiated digitally in the system.
**Limitations:**
- No automated tracking system integration (RFID/IoT) exists currently; all data entry is manual.
- Currently supports single-currency financial inputs for purchases (INR/USD abstractly handled).

### 2. Tech Stack & Architecture
**Architecture:** The project employs a strict Separation of Concerns (SoC) using a decoupled client-server model.
**Frontend:** 
- **React 18 & Vite:** Chosen for blazing-fast HMR and optimized production bundles.
- **Tailwind-inspired Inline styling:** A bespoke CSS-in-JS architecture mimicking Tailwind but avoiding compilation lock-ins, resulting in an immersive dark glassmorphism aesthetic.
- **Recharts:** For real-time, interactive dashboard analytics.

**Backend:**
- **Node.js + Express:** Selected for high-throughput asynchronous capability perfectly suited for lots of API operations.
- **Middleware-heavy Pipeline:** JWT authentication, RBAC authorization, and API Audit logging are completely abstracted into reusable middleware components.

**Database:**
- **SQLite (via `better-sqlite3`):** Specifically chosen for its `WAL` (Write-Ahead Logging) format allowing extremely fast read/write concurrency. It makes the system highly portable and incredibly simple to deploy in bounded military silos without massive DBA overhead.

### 3. Data Models / Schema
The relational database adheres to normalization standards. Core entities include:
- `users`: Stores military personnel credentials, hashed passwords, and foreign keys mapping them to specific `bases`.
- `bases`: Locations within the military network.
- `equipment_types`: Master dictionary of trackable asset categories (weapons, vehicles, etc).
- `purchases`: Ledger of all items entering the overall system inventory.
- `transfers`: Ledger of assets moving from one base to another. Includes validation logic preventing same-base transfers.
- `assignments`: Sub-ledger tracking assets handed out to specific personnel temporarily.
- `expenditures`: Ledger tracking consumed assets (e.g., training ammunition usage, destroyed equipment).
- `audit_logs`: A forensic read-only table automatically populated by Express middleware capturing user IDs, endpoints hit, and request payloads.

### 4. RBAC Explanation
Role-Based Access Control is enforced completely backend-side ensuring zero trust. Roles include:
- **Admin:** Supreme access. Unbounded visualization of all bases, equipment, and network movements.
- **Base Commander:** Restricted contextually to their `base_id`. Can view metrics, approve expenditures, and assign assets, but cannot visualize or alter data outside their base.
- **Logistics Officer:** Can originate transfers out and record purchases into their specific base infrastructure, but restricted from overriding system parameters.

*Enforcement Method:* The JSON Web Token (JWT) injects the user's `role` and `base_id` into the Express `req` object. The `rbac.js` logic validates the `role` and a secondary scoping middleware automatically intercepts queries and appends `WHERE base_id = X`, enforcing data-isolation natively without frontend dependency.

### 5. API Logging
We employ a bespoke Express middleware (`auditLogger.js`) that wraps every system-mutative endpoint (`POST`, `PUT`, `DELETE`). 
When a request flows in, the middleware inspects the `req.user.id`, the `req.method`, the exact path `req.originalUrl`, and a JSON-stringified representation of the `req.body`. This data is asynchronously committed to the `audit_logs` table before the client receives the `2xx` response, forming an immutable ledger of accountability.

### 6. Setup Instructions
**(Assumes Node.js is installed)**
1. **Clone & Install:**
   - Run `npm install` inside both the `/frontend` and `/backend` directories.
2. **Database Initialization:**
   - Run `npm run seed` in the `/backend` directory to dynamically generate `database.sqlite` and insert dummy historical military test data.
3. **Environment setup:**
   - Frontend `VITE_API_URL` pointing to backend.
   - Backend `.env` requiring `PORT` and `JWT_SECRET`.
4. **Execution:**
   - Execute `npm start` in the backend and `npm run dev` in the frontend.

### 7. API Endpoints
**Authentication:**
- `POST /api/auth/login` (Returns JWT)
- `GET /api/auth/profile` (Protected)
**Asset Flow (All Protected):**
- `GET /api/dashboard/summary` (Returns computed Opening/Closing balances)
- `POST /api/purchases` (Ingests base assets)
- `POST /api/transfers` (Transfers internally)
- `POST /api/assignments` (Allocates locally)
- `POST /api/expenditures` (Marks assets as permanently consumed/destroyed)

### 8. Login Credentials
Live Environment Credentials. All accounts use password: **`admin123`** for Admin, and **`cmd123`** for Commanders, **`log123`** for Logistics.

| Account Type | Username | Password | Scope / Visibility |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admin123` | World View (All Bases) |
| **Commander Alpha** | `commander_alpha` | `cmd123` | Alpha Base Only |
| **Logistics Alpha** | `logistics_alpha` | `log123` | Alpha Base Only |
| **Commander Bravo** | `commander_bravo` | `cmd123` | Bravo Base Only |

### Deployed Links
- **Frontend Environment:** http://mil-assets.vercel.app
- **Backend Environment:** https://milassets.onrender.com 
