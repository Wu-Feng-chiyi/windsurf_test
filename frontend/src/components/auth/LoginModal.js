import React, { useState } from 'react';
import './Auth.css';

const LoginModal = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending login data:', formData);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        // 儲存 token 到 localStorage
        localStorage.setItem('token', data.token);
        // 關閉模態框
        onClose();
        // 重新整理頁面以更新用戶狀態
        window.location.reload();
      } else {
        setError(data.message || '登入失敗，請檢查您的帳號密碼');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('登入時發生錯誤，請稍後再試');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>登入</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">電子郵件</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">登入</button>
        </form>
        <p className="switch-text">
          還沒有帳號？
          <button className="switch-button" onClick={onSwitchToRegister}>
            立即註冊
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
