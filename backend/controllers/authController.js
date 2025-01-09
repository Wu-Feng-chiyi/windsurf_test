const userService = require('../services/userService');

// 輔助函數：統一的錯誤響應格式
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

// 輔助函數：統一的成功響應格式
const successResponse = (res, data, message = '操作成功') => {
  return res.json({
    success: true,
    message,
    ...data
  });
};

exports.register = async (req, res) => {
  try {
    // 驗證請求數據
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return errorResponse(res, 400, '所有字段都是必填的');
    }

    // 創建用戶
    const user = await userService.createUser({ name, email, password });
    
    // 生成 token
    const token = userService.generateToken(user);

    // 返回響應
    return successResponse(res, {
      token,
      user
    }, '註冊成功');

  } catch (error) {
    if (error.message === '該電子郵件已被註冊') {
      return errorResponse(res, 400, error.message);
    }
    console.error('註冊錯誤:', error);
    return errorResponse(res, 500, '註冊過程中發生錯誤');
  }
};

exports.login = async (req, res) => {
  try {
    // 驗證請求數據
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 400, '請提供電子郵件和密碼');
    }

    // 驗證用戶
    const user = await userService.validateUser(email, password);
    
    // 生成 token
    const token = userService.generateToken(user);

    // 返回響應
    return successResponse(res, {
      token,
      user
    }, '登入成功');

  } catch (error) {
    if (error.message === '無效的憑證') {
      return errorResponse(res, 401, error.message);
    }
    console.error('登入錯誤:', error);
    return errorResponse(res, 500, '登入過程中發生錯誤');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    return successResponse(res, { user });
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error);
    return errorResponse(res, 500, '獲取用戶資料時發生錯誤');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    return successResponse(res, { user: updatedUser }, '用戶資料更新成功');
  } catch (error) {
    if (error.message === '該電子郵件已被使用') {
      return errorResponse(res, 400, error.message);
    }
    console.error('更新用戶資料錯誤:', error);
    return errorResponse(res, 500, '更新用戶資料時發生錯誤');
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const newToken = await userService.refreshToken(req.user.id);
    return successResponse(res, { token: newToken }, 'Token 刷新成功');
  } catch (error) {
    console.error('刷新 Token 錯誤:', error);
    return errorResponse(res, 500, '刷新 Token 時發生錯誤');
  }
};
