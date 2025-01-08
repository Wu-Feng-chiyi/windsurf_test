const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未授權訪問'
    });
  }

  try {
    // 驗證 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: '未授權訪問'
    });
  }
};

// 授權角色
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '該用戶角色未被授權訪問'
      });
    }
    next();
  };
};
