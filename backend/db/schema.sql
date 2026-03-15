-- Military Asset Management System - Database Schema
-- SQLite

PRAGMA foreign_keys = ON;

-- Military Bases
CREATE TABLE IF NOT EXISTS bases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Types
CREATE TABLE IF NOT EXISTS equipment_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('weapon', 'vehicle', 'ammunition', 'equipment')),
  unit TEXT NOT NULL DEFAULT 'units',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'base_commander', 'logistics_officer')),
  base_id INTEGER REFERENCES bases(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_id INTEGER NOT NULL REFERENCES bases(id),
  equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price REAL DEFAULT 0,
  supplier TEXT,
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transfers
CREATE TABLE IF NOT EXISTS transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_base_id INTEGER NOT NULL REFERENCES bases(id),
  to_base_id INTEGER NOT NULL REFERENCES bases(id),
  equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  transfer_date DATE NOT NULL,
  status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'in_transit', 'completed', 'cancelled')),
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CHECK(from_base_id != to_base_id)
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_id INTEGER NOT NULL REFERENCES bases(id),
  equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
  assigned_to TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  assignment_date DATE NOT NULL,
  return_date DATE,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'returned')),
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expenditures
CREATE TABLE IF NOT EXISTS expenditures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  base_id INTEGER NOT NULL REFERENCES bases(id),
  equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  expenditure_date DATE NOT NULL,
  reason TEXT,
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchases_base ON purchases(base_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_transfers_from ON transfers(from_base_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to ON transfers(to_base_id);
CREATE INDEX IF NOT EXISTS idx_transfers_date ON transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_assignments_base ON assignments(base_id);
CREATE INDEX IF NOT EXISTS idx_expenditures_base ON expenditures(base_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
