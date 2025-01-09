const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

async function createTestUser() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_NAME || 'fullstack_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const connection = await pool.getConnection();
    try {
      // 創建 users 表（如果不存在）
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // 生成測試用戶數據
      const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      };

      // 檢查用戶是否已存在
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [testUser.email]
      );

      if (existingUsers.length > 0) {
        console.log('Test user already exists');
        return;
      }

      // 插入測試用戶
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [testUser.name, testUser.email, testUser.password]
      );

      console.log('Test user created successfully:', {
        id: result.insertId,
        name: testUser.name,
        email: testUser.email
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();
