const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '866572',
  database: 'eduAudit1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ MySQL connection established successfully.');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
  }
})();

module.exports = db;