const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 配置 CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
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
});

// 測試路由
app.get('/api/test', (req, res) => {
  console.log('Received GET request to /api/test');
  res.json({ message: 'Backend is working!' });
});

// 創建用戶
app.post('/api/users', (req, res) => {
  console.log('Received POST request to /api/users:', req.body);
  
  const { name, email } = req.body;
  
  if (!name || !email) {
    console.log('Missing required fields');
    return res.status(400).json({ error: '姓名和電子郵件都是必填的' });
  }

  const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
  
  db.query(query, [name, email], (err, result) => {
    if (err) {
      console.error('Error creating user:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: '該電子郵件已經被使用' });
      }
      return res.status(500).json({ error: '創建用戶失敗' });
    }
    console.log('User created successfully:', { id: result.insertId, name, email });
    res.status(201).json({ id: result.insertId, name, email });
  });
});

// 獲取所有用戶
app.get('/api/users', (req, res) => {
  console.log('Fetching all users');
  const query = 'SELECT * FROM users ORDER BY id DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: '獲取用戶列表失敗' });
    }
    console.log('Found users:', results.length);
    res.json(results);
  });
});

// 獲取單個用戶
app.get('/api/users/:id', (req, res) => {
  console.log('Received GET request to /api/users/:id:', req.params.id);
  const query = 'SELECT * FROM users WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: '獲取用戶信息失敗' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: '找不到該用戶' });
    }
    res.json(results[0]);
  });
});

// 更新用戶
app.put('/api/users/:id', (req, res) => {
  console.log('Received PUT request to /api/users/:id:', req.params.id, req.body);
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: '姓名和電子郵件都是必填的' });
  }

  const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
  
  db.query(query, [name, email, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: '該電子郵件已經被使用' });
      }
      return res.status(500).json({ error: '更新用戶失敗' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '找不到該用戶' });
    }
    res.json({ id: req.params.id, name, email });
  });
});

// 刪除用戶
app.delete('/api/users/:id', (req, res) => {
  console.log('Received DELETE request to /api/users/:id:', req.params.id);
  const query = 'DELETE FROM users WHERE id = ?';
  
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: '刪除用戶失敗' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '找不到該用戶' });
    }
    res.json({ message: '用戶已成功刪除' });
  });
});

const PORT = process.env.PORT || 5000;
// 監聽所有網絡接口
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
