const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// 配置 CORS
app.use(cors({
  origin: '*',  // 允許所有來源
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// 創建數據庫連接
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'fullstack_db'
});

// 連接到數據庫
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to database');

  // 先刪除已存在的表（如果存在）
  db.query('DROP TABLE IF EXISTS users', (err) => {
    if (err) {
      console.error('Error dropping users table:', err);
      return;
    }
    console.log('Dropped users table if existed');

    // 創建用戶表
    const createTableQuery = `
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role ENUM('user', 'agent', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
        return;
      }
      console.log('Users table created successfully');
    });
  });
});

// 測試路由
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// 註冊路由
app.post('/api/auth/register', async (req, res) => {
  console.log('Received registration request:', req.body);
  
  const { name, email, password, phone } = req.body;
  
  // 驗證必填字段
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ 
      success: false,
      message: '所有字段都是必填的' 
    });
  }

  try {
    // 檢查郵箱是否已存在
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false,
          message: '伺服器錯誤' 
        });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: '該電子郵件已被註冊' 
        });
      }

      // 加密密碼
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 創建新用戶
      const user = {
        name,
        email,
        password: hashedPassword,
        phone
      };

      db.query('INSERT INTO users SET ?', user, (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ 
            success: false,
            message: '創建用戶時發生錯誤' 
          });
        }

        res.status(201).json({
          success: true,
          message: '註冊成功'
        });
      });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      success: false,
      message: '伺服器錯誤' 
    });
  }
});

// 登入路由
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // 驗證必填字段
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: '請提供電子郵件和密碼' 
    });
  }

  try {
    // 查找用戶
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false,
          message: '伺服器錯誤' 
        });
      }

      if (results.length === 0) {
        return res.status(401).json({ 
          success: false,
          message: '無效的憑證' 
        });
      }

      const user = results[0];

      // 驗證密碼
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: '無效的憑證' 
        });
      }

      // 生成 JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '30d' }
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      success: false,
      message: '伺服器錯誤' 
    });
  }
});

// 獲取當前用戶信息
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: '未授權訪問' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');

    db.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ 
          success: false,
          message: '伺服器錯誤' 
        });
      }

      if (results.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: '用戶不存在' 
        });
      }

      res.status(200).json({
        success: true,
        data: results[0]
      });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(401).json({ 
      success: false,
      message: '未授權訪問' 
    });
  }
});

const PORT = process.env.PORT || 5000;

// 監聽所有網絡接口
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
