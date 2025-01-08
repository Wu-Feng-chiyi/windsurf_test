import React, { useState, useEffect } from 'react';
import './Auth.css';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [shake, setShake] = useState(false);

  const checkPasswordStrength = (password) => {
    if (!password) return '';
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    const score = [hasLower, hasUpper, hasNumber, hasSpecial]
      .filter(Boolean).length + (length >= 8 ? 1 : 0);

    if (score < 2) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const showError = (message) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError('密碼不一致');
      return;
    }

    if (passwordStrength === 'weak') {
      showError('密碼強度太弱，請使用更複雜的密碼');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      
      console.log('Sending registration request...');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        onSwitchToLogin();
      } else {
        showError(data.message || '註冊失敗，請稍後再試');
      }
    } catch (err) {
      console.error('Registration error:', err);
      showError('註冊時發生錯誤，請稍後再試');
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${shake ? 'error-shake' : ''}`}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>註冊新帳號</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <div className="input-icon">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="請輸入您的姓名"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">電子郵件</label>
            <div className="input-icon">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">密碼</label>
            <div className="input-icon">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="至少 8 個字符"
                required
                minLength="8"
              />
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className={`strength-meter ${passwordStrength}`}>
                  <div></div>
                </div>
                <span>{passwordStrength && `密碼強度: ${
                  passwordStrength === 'weak' ? '弱' :
                  passwordStrength === 'medium' ? '中' : '強'
                }`}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">確認密碼</label>
            <div className="input-icon">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="再次輸入密碼"
                required
                minLength="8"
              />
            </div>
          </div>
          <button type="submit" className="submit-button">
            註冊
          </button>
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
