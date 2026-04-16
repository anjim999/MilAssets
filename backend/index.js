const app = require('./app');
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Initialize database schema
console.log('🔧 Initializing database...');
const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf-8');
db.exec(schema);
console.log('✅ Database schema applied.');

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Military Asset Management API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
