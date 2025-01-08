const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 註冊速率限制
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 5, // 限制每個IP 5次註冊嘗試
  message: '註冊嘗試次數過多，請稍後再試'
});

// 登入速率限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分鐘
  max: 10, // 限制每個IP 10次登入嘗試
  message: '登入嘗試次數過多，請稍後再試'
});

// 密碼複雜度驗證
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// @route   POST /api/auth/register
// @desc    註冊用戶
// @access  Public
router.post(
  '/register', 
  registerLimiter,
  [
    body('name').trim().notEmpty().withMessage('姓名不能為空'),
    body('email').isEmail().withMessage('請提供有效的電子郵件'),
    body('password').custom((value) => {
      if (!validatePassword(value)) {
        throw new Error('密碼必須包含大小寫字母、數字和特殊字符，且至少8個字符');
      }
      return true;
    }),
    body('phone').isMobilePhone('zh-TW').withMessage('請提供有效的台灣手機號碼')
  ],
  async (req, res) => {
    // 驗證輸入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

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
        phone,
        twoFactorSecret: crypto.randomBytes(32).toString('hex') // 為每個用戶生成唯一的雙因素驗證密鑰
      });

      // 發送歡迎郵件
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: '"Real Estate Platform" <noreply@realestate.com>',
        to: email,
        subject: '歡迎註冊 Real Estate Platform',
        text: `歡迎 ${name}，您已成功註冊 Real Estate Platform！`
      });

      res.status(201).json({
        success: true,
        message: '註冊成功，請檢查您的郵箱',
        twoFactorSecret: user.twoFactorSecret // 在生產環境中，這應該通過安全的方式傳遞
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: '伺服器錯誤'
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    用戶登入
// @access  Public
router.post(
  '/login', 
  loginLimiter,
  [
    body('email').isEmail().withMessage('請提供有效的電子郵件'),
    body('password').notEmpty().withMessage('密碼不能為空')
  ],
  async (req, res) => {
    // 驗證輸入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    try {
      const { email, password, twoFactorCode } = req.body;

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

      // 雙因素驗證
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.status(400).json({
            success: false,
            message: '需要兩步驟驗證碼'
          });
        }

        const isValidCode = user.verifyTwoFactorCode(twoFactorCode);
        if (!isValidCode) {
          return res.status(401).json({
            success: false,
            message: '兩步驟驗證碼無效'
          });
        }
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
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: '伺服器錯誤'
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    重置密碼
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '未找到該用戶'
      });
    }

    // 生成密碼重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10分鐘有效

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // 發送密碼重置郵件
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: '"Real Estate Platform" <noreply@realestate.com>',
      to: email,
      subject: '密碼重置',
      text: `您正在申請密碼重置。請點擊以下連結重置密碼：${resetUrl}`
    });

    res.status(200).json({
      success: true,
      message: '密碼重置郵件已發送'
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
