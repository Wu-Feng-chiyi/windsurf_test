import React, { useState } from 'react';
import './Auth.css';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
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
    
    // 驗證密碼
    if (formData.password !== formData.confirmPassword) {
      setError('密碼不一致');
      return;
    }

    try {
      // 移除 confirmPassword，因為後端不需要這個字段
      const { confirmPassword, ...registerData } = formData;
      
      console.log('Sending registration data:', registerData);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok) {
        // 註冊成功後切換到登入頁面
        onSwitchToLogin();
      } else {
        setError(data.message || '註冊失敗，請稍後再試');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('註冊時發生錯誤，請稍後再試');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>註冊新帳號</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
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
            <label htmlFor="phone">手機號碼</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="09[0-9]{8}"
              title="請輸入有效的台灣手機號碼（格式：09xxxxxxxx）"
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
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">確認密碼</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="submit-button">註冊</button>
        </form>
        <p className="switch-text">
          已經有帳號？
          <button className="switch-button" onClick={onSwitchToLogin}>
            立即登入
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
