const express = require('express');
const mysql = require('mysql2/promise');  // 使用 promise 版本
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// 配置 CORS
const allowedOrigins = ['http://localhost:3000', 'http://35.229.228.224'];

app.use(cors({
  origin: function(origin, callback) {
    // 允許沒有 origin 的請求（例如移動應用）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 處理預檢請求
app.options('*', cors({
  origin: function(origin, callback) {
    // 允許沒有 origin 的請求（例如移動應用）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 創建數據庫連接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'fullstack_db',
  waitForConnections: true,
  connectionLimit: 10,  // 最大連接數
  queueLimit: 0,        // 無限制排隊
  connectTimeout: 10000 // 10秒連接超時
});

// 測試數據庫連接
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MySQL database');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
  });

// 驗證 JWT Token 的中間件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供認證令牌'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        throw new Error('用戶不存在');
      }

      req.user = users[0];
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token 已過期',
        expired: true
      });
    }
    return res.status(401).json({
      success: false,
      message: '無效的認證令牌'
    });
  }
};

// 生成 JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '1h' }
  );
};

// 生成刷新 Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
    { expiresIn: '7d' }
  );
};

// 初始化數據庫
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // 先刪除已存在的表（如果存在）
    await connection.query('DROP TABLE IF EXISTS users');
    console.log('Dropped users table if existed');

    // 創建用戶表
    const createTableQuery = `
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'agent', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await connection.query(createTableQuery);
    console.log('Users table created successfully');

    connection.release();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// 初始化數據庫
initDatabase();

// 測試路由
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// 註冊路由
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('註冊請求收到:', { name, email });

  if (!name || !email || !password) {
    console.log('缺少必要字段:', { name: !!name, email: !!email, password: !!password });
    return res.status(400).json({
      success: false,
      message: '請提供所有必要的資訊'
    });
  }

  try {
    const connection = await pool.getConnection();
    try {
      // 檢查郵箱是否已存在
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        console.log('郵箱已被註冊:', email);
        return res.status(400).json({
          success: false,
          message: '此郵箱已被註冊'
        });
      }

      // 加密密碼
      const hashedPassword = await bcrypt.hash(password, 10);

      // 創建新用戶
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );

      // 生成 JWT token
      const accessToken = jwt.sign(
        { id: result.insertId, email },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { id: result.insertId, email },
        process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
        { expiresIn: '7d' }
      );

      console.log('註冊成功:', { id: result.insertId, name, email });

      res.status(201).json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: result.insertId,
          name,
          email
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

// 刷新 Token 路由
app.post('/api/auth/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: '未提供刷新令牌'
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret'
    );

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        throw new Error('用戶不存在');
      }

      const user = users[0];
      const newAccessToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      console.log('刷新令牌成功:', { id: user.id, email: user.email });  

      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('刷新令牌錯誤:', error);  
    return res.status(401).json({
      success: false,
      message: '無效的刷新令牌'
    });
  }
});

// 登入路由
app.post('/api/auth/login', async (req, res) => {
  console.log('登入請求收到:', req.body);  
  
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('缺少必要字段:', { email: !!email, password: !!password });  
    return res.status(400).json({
      success: false,
      message: '請提供電子郵件和密碼'
    });
  }

  try {
    const connection = await pool.getConnection();
    try {
      console.log('查詢數據庫用戶:', email);  
  
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        console.log('用戶不存在:', email);  
        return res.status(401).json({
          success: false,
          message: '無效的憑證'
        });
      }

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log('密碼不匹配:', email);  
        return res.status(401).json({
          success: false,
          message: '無效的憑證'
        });
      }

      console.log('登入成功:', email);  

      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('登入錯誤:', error);  
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

// 獲取當前用戶信息
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    console.log('獲取當前用戶信息:', req.user);  
    
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (err) {
    console.error('伺服器錯誤:', err);  
    
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
