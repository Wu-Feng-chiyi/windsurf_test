const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

class UserService {
  // 創建用戶
  async createUser(userData) {
    const { name, email, password } = userData;
    
    const connection = await pool.getConnection();
    try {
      // 檢查郵箱是否已存在
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ?', 
        [email]
      );

      if (existingUsers.length > 0) {
        throw new Error('該電子郵件已被註冊');
      }

      // 加密密碼
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 插入新用戶
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );

      return {
        id: result.insertId,
        name,
        email
      };
    } finally {
      connection.release();
    }
  }

  // 驗證用戶
  async validateUser(email, password) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        throw new Error('無效的憑證');
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('無效的憑證');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    } finally {
      connection.release();
    }
  }

  // 生成 JWT Token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { 
        expiresIn: '24h' // 延長 token 有效期
      }
    );
  }

  // 刷新 Token
  async refreshToken(userId) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('用戶不存在');
      }

      const user = users[0];
      return this.generateToken(user);
    } finally {
      connection.release();
    }
  }

  // 獲取用戶資料
  async getUserProfile(userId) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('用戶不存在');
      }

      return users[0];
    } finally {
      connection.release();
    }
  }

  // 更新用戶資料
  async updateUserProfile(userId, updateData) {
    const connection = await pool.getConnection();
    try {
      const allowedUpdates = ['name', 'email', 'password'];
      const updates = {};
      
      // 過濾有效的更新字段
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedUpdates.includes(key) && value) {
          updates[key] = value;
        }
      }

      // 如果要更新密碼，需要加密
      if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);
      }

      // 如果要更新郵箱，檢查是否已存在
      if (updates.email) {
        const [existingUsers] = await connection.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [updates.email, userId]
        );

        if (existingUsers.length > 0) {
          throw new Error('該電子郵件已被使用');
        }
      }

      // 構建更新查詢
      const updateFields = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');
      
      if (updateFields) {
        await connection.query(
          `UPDATE users SET ${updateFields} WHERE id = ?`,
          [...Object.values(updates), userId]
        );
      }

      // 返回更新後的用戶資料
      const [updatedUser] = await connection.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [userId]
      );

      return updatedUser[0];
    } finally {
      connection.release();
    }
  }
}

module.exports = new UserService();
