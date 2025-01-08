const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請輸入姓名'],
    trim: true,
    maxlength: [50, '姓名不能超過50個字符']
  },
  email: {
    type: String,
    required: [true, '請輸入電子郵件'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '請輸入有效的電子郵件地址'
    ]
  },
  password: {
    type: String,
    required: [true, '請輸入密碼'],
    minlength: [6, '密碼至少需要6個字符'],
    select: false
  },
  phone: {
    type: String,
    required: [true, '請輸入手機號碼'],
    match: [/^09\d{8}$/, '請輸入有效的台灣手機號碼']
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 加密密碼
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 生成 JWT Token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'your-jwt-secret',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

// 驗證密碼
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
