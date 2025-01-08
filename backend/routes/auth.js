const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    註冊用戶
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 檢查郵箱是否已存在
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: '該電子郵件已被註冊'
      });
    }

    // 創建用戶
    user = await User.create({
      name,
      email,
      password,
      phone
    });

    res.status(201).json({
      success: true,
      message: '註冊成功'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

// @route   POST /api/auth/login
// @desc    用戶登入
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 驗證郵箱和密碼
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '請提供電子郵件和密碼'
      });
    }

    // 檢查用戶
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '無效的憑證'
      });
    }

    // 檢查密碼
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '無效的憑證'
      });
    }

    // 創建 token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

// @route   GET /api/auth/me
// @desc    獲取當前用戶信息
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '伺服器錯誤'
    });
  }
});

module.exports = router;
