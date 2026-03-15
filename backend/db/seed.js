const db = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function seed() {
  console.log('🔧 Running schema...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);

  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    console.log('✅ Database already seeded. Skipping.');
    return;
  }

  console.log('🌱 Seeding database...');

  // --- Bases ---
  const insertBase = db.prepare('INSERT INTO bases (name, location) VALUES (?, ?)');
  const bases = [
    ['Alpha Base', 'Fort Alpha, New Delhi'],
    ['Bravo Base', 'Camp Bravo, Mumbai'],
    ['Charlie Base', 'Station Charlie, Chennai'],
  ];
  bases.forEach(b => insertBase.run(...b));
  console.log('  ✅ Bases created');

  // --- Equipment Types ---
  const insertEquip = db.prepare('INSERT INTO equipment_types (name, category, unit) VALUES (?, ?, ?)');
  const equipments = [
    ['M4 Assault Rifle', 'weapon', 'units'],
    ['AK-47 Rifle', 'weapon', 'units'],
    ['9mm Pistol', 'weapon', 'units'],
    ['Humvee', 'vehicle', 'vehicles'],
    ['Armored Personnel Carrier', 'vehicle', 'vehicles'],
    ['Transport Truck', 'vehicle', 'vehicles'],
    ['5.56mm Ammunition', 'ammunition', 'rounds'],
    ['7.62mm Ammunition', 'ammunition', 'rounds'],
    ['9mm Ammunition', 'ammunition', 'rounds'],
    ['Body Armor', 'equipment', 'units'],
    ['Night Vision Goggles', 'equipment', 'units'],
    ['Radio Set', 'equipment', 'units'],
  ];
  equipments.forEach(e => insertEquip.run(...e));
  console.log('  ✅ Equipment types created');

  // --- Users ---
  const insertUser = db.prepare('INSERT INTO users (username, password_hash, full_name, role, base_id) VALUES (?, ?, ?, ?, ?)');
  const salt = bcrypt.genSaltSync(10);
  const users = [
    ['admin', bcrypt.hashSync('admin123', salt), 'System Administrator', 'admin', null],
    ['commander_alpha', bcrypt.hashSync('cmd123', salt), 'Col. Rajesh Kumar', 'base_commander', 1],
    ['commander_bravo', bcrypt.hashSync('cmd123', salt), 'Col. Priya Sharma', 'base_commander', 2],
    ['logistics_alpha', bcrypt.hashSync('log123', salt), 'Lt. Arjun Singh', 'logistics_officer', 1],
  ];
  users.forEach(u => insertUser.run(...u));
  console.log('  ✅ Users created');

  // --- Purchases (realistic data over past 6 months) ---
  const insertPurchase = db.prepare(
    'INSERT INTO purchases (base_id, equipment_type_id, quantity, unit_price, supplier, purchase_date, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const purchaseData = [
    [1, 1, 50, 1200, 'Defense Corp India', '2025-11-15', 'Initial procurement batch', 1],
    [1, 7, 10000, 0.50, 'Ammo Supplies Ltd', '2025-11-20', 'Standard ammunition restock', 1],
    [1, 4, 5, 85000, 'Military Vehicles Inc', '2025-12-01', 'Patrol vehicle procurement', 1],
    [1, 10, 100, 450, 'Armor Systems Pvt Ltd', '2025-12-15', 'Body armor for Alpha Base', 1],
    [1, 11, 30, 3200, 'NightTech Solutions', '2026-01-10', 'Night vision equipment', 1],
    [2, 1, 40, 1200, 'Defense Corp India', '2025-11-18', 'Bravo Base initial supply', 1],
    [2, 2, 60, 800, 'Arms Dealer Pvt', '2025-12-05', 'AK-47 batch for training', 1],
    [2, 8, 15000, 0.45, 'Ammo Supplies Ltd', '2025-12-20', 'Ammunition order', 1],
    [2, 5, 3, 250000, 'Heavy Armor Corp', '2026-01-05', 'APC procurement', 1],
    [2, 12, 25, 1800, 'Comm Systems Ltd', '2026-01-20', 'Communication equipment', 1],
    [3, 3, 80, 600, 'Sidearm Industries', '2025-11-25', 'Pistol procurement', 1],
    [3, 6, 8, 45000, 'Transport Motors', '2025-12-10', 'Transport trucks', 1],
    [3, 9, 20000, 0.30, 'Ammo Supplies Ltd', '2026-01-15', '9mm ammo batch', 1],
    [3, 10, 75, 450, 'Armor Systems Pvt Ltd', '2026-02-01', 'Body armor for Charlie', 1],
    [1, 1, 25, 1200, 'Defense Corp India', '2026-02-15', 'Additional rifles', 1],
    [1, 7, 5000, 0.50, 'Ammo Supplies Ltd', '2026-03-01', 'Quarterly restock', 1],
    [2, 4, 3, 85000, 'Military Vehicles Inc', '2026-03-10', 'Additional Humvees', 1],
    [3, 11, 20, 3200, 'NightTech Solutions', '2026-03-15', 'NVG procurement', 1],
    [1, 12, 15, 1800, 'Comm Systems Ltd', '2026-03-20', 'Radio sets for Alpha', 1],
    [2, 10, 50, 450, 'Armor Systems Pvt Ltd', '2026-04-01', 'Armor restock', 1],
  ];
  purchaseData.forEach(p => insertPurchase.run(...p));
  console.log('  ✅ Purchases created');

  // --- Transfers ---
  const insertTransfer = db.prepare(
    'INSERT INTO transfers (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const transferData = [
    [1, 2, 1, 10, '2025-12-20', 'completed', 'Rifle transfer to Bravo', 1],
    [2, 3, 2, 15, '2026-01-05', 'completed', 'AK-47 to Charlie for training', 1],
    [1, 3, 7, 2000, '2026-01-15', 'completed', 'Ammunition support', 1],
    [3, 1, 3, 20, '2026-02-01', 'completed', 'Pistol transfer to Alpha', 1],
    [2, 1, 5, 1, '2026-02-10', 'completed', 'APC redeployment', 1],
    [1, 2, 11, 10, '2026-02-20', 'completed', 'NVG transfer', 1],
    [3, 2, 6, 2, '2026-03-05', 'completed', 'Truck transfer', 1],
    [1, 3, 10, 20, '2026-03-15', 'completed', 'Body armor support', 1],
    [2, 3, 12, 5, '2026-03-25', 'completed', 'Radio set transfer', 1],
    [1, 2, 7, 1500, '2026-04-05', 'in_transit', 'Ammo shipment in transit', 1],
  ];
  transferData.forEach(t => insertTransfer.run(...t));
  console.log('  ✅ Transfers created');

  // --- Assignments ---
  const insertAssign = db.prepare(
    'INSERT INTO assignments (base_id, equipment_type_id, assigned_to, quantity, assignment_date, return_date, status, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const assignmentData = [
    [1, 1, 'Sgt. Vikram Patel', 2, '2025-12-25', null, 'active', 'Field duty assignment', 2],
    [1, 11, 'Cpl. Ananya Rao', 1, '2026-01-05', null, 'active', 'Recon mission', 2],
    [1, 4, 'Lt. Deepak Nair', 1, '2026-01-15', null, 'active', 'Patrol duty', 2],
    [1, 10, 'Pvt. Kiran Das', 1, '2026-02-01', '2026-03-01', 'returned', 'Training exercise', 2],
    [2, 1, 'Sgt. Meera Reddy', 3, '2025-12-28', null, 'active', 'Guard duty', 3],
    [2, 2, 'Cpl. Rahul Verma', 2, '2026-01-10', null, 'active', 'Training assignment', 3],
    [2, 5, 'Maj. Suresh Iyer', 1, '2026-02-15', null, 'active', 'Convoy duty', 3],
    [3, 3, 'Sgt. Pradeep Kumar', 1, '2026-01-20', null, 'active', 'Base security', 1],
    [3, 6, 'Cpl. Lakshmi Bhat', 1, '2026-02-05', null, 'active', 'Supply run', 1],
    [3, 10, 'Pvt. Arun Menon', 1, '2026-02-20', null, 'active', 'Field deployment', 1],
    [1, 1, 'Pvt. Ravi Sharma', 1, '2026-03-01', '2026-03-20', 'returned', 'Temporary assignment', 2],
    [2, 12, 'Lt. Nisha Gupta', 2, '2026-03-05', null, 'active', 'Communication duty', 3],
    [1, 12, 'Sgt. Amit Joshi', 1, '2026-03-25', null, 'active', 'Comm operations', 2],
    [3, 11, 'Cpl. Divya Nair', 1, '2026-04-01', null, 'active', 'Surveillance mission', 1],
  ];
  assignmentData.forEach(a => insertAssign.run(...a));
  console.log('  ✅ Assignments created');

  // --- Expenditures ---
  const insertExpend = db.prepare(
    'INSERT INTO expenditures (base_id, equipment_type_id, quantity, expenditure_date, reason, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const expenditureData = [
    [1, 7, 500, '2026-01-10', 'Live fire training', 'Quarterly range exercise', 2],
    [1, 7, 300, '2026-02-15', 'Combat training', 'Unit readiness drill', 2],
    [2, 8, 800, '2026-01-20', 'Firing range practice', 'Monthly practice', 3],
    [2, 8, 600, '2026-03-10', 'Training exercise', 'Combined arms drill', 3],
    [3, 9, 1000, '2026-02-01', 'Security drill', 'Base defense exercise', 1],
    [3, 9, 500, '2026-03-20', 'Qualification test', 'Annual qualification', 1],
    [1, 7, 200, '2026-03-25', 'Field exercise', 'Joint operation drill', 2],
    [2, 9, 400, '2026-04-05', 'Training', 'New recruit training', 3],
  ];
  expenditureData.forEach(e => insertExpend.run(...e));
  console.log('  ✅ Expenditures created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('  admin / admin123 (Admin - Full access)');
  console.log('  commander_alpha / cmd123 (Base Commander - Alpha Base)');
  console.log('  commander_bravo / cmd123 (Base Commander - Bravo Base)');
  console.log('  logistics_alpha / log123 (Logistics Officer - Alpha Base)');
}

seed();
