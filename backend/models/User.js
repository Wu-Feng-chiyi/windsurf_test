const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請提供姓名'],
    trim: true
  },
  email: {
    type: String,
    required: [true, '請提供電子郵件'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '請提供有效的電子郵件'
    ]
  },
  password: {
    type: String,
    required: [true, '請提供密碼'],
    minlength: 8,
    select: false
  },
  phone: {
    type: String,
    required: [true, '請提供手機號碼'],
    match: [/^09\d{8}$/, '請提供有效的台灣手機號碼']
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'admin'],
    default: 'user'
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 密碼加密中間件
UserSchema.pre('save', async function(next) {
  // 只有在密碼被修改時才加密
  if (!this.isModified('password')) return next();

  // 加鹽並雜湊密碼
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// 密碼比對方法
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT Token生成方法
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET || 'your-jwt-secret', 
    { expiresIn: '1d' }
  );
};

// 兩步驟驗證方法
UserSchema.methods.generateTwoFactorQR = function() {
  const secret = speakeasy.generateSecret({ name: "RealEstate Platform" });
  this.twoFactorSecret = secret.base32;
  return secret.otpauth_url;
};

UserSchema.methods.verifyTwoFactorCode = function(token) {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token
  });
};

// 密碼重置方法
UserSchema.methods.getResetPasswordToken = function() {
  // 生成令牌
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 設置重置令牌雜湊值和過期時間
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 設置過期時間
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10分鐘

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
