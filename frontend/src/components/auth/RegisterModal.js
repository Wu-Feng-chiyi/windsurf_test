import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      showError('請輸入姓名');
      return false;
    }

    if (!formData.email.trim()) {
      showError('請輸入電子郵件');
      return false;
    }

    if (!formData.password) {
      showError('請輸入密碼');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('密碼不一致');
      return false;
    }

    if (passwordStrength === 'weak') {
      showError('密碼強度太弱，請使用更複雜的密碼');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      onClose();
    } catch (err) {
      console.error('Registration error:', err);
      showError(err.response?.data?.message || '註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#ff4d4d';
      case 'medium': return '#ffd700';
      case 'strong': return '#00cc00';
      default: return '#ccc';
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${shake ? 'error-shake' : ''}`}>
        <button 
          className="close-button" 
          onClick={onClose}
          disabled={loading}
        >
          &times;
        </button>
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
              disabled={loading}
              autoComplete="name"
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
              disabled={loading}
              autoComplete="email"
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
              disabled={loading}
              autoComplete="new-password"
            />
            {formData.password && (
              <div className="password-strength" style={{ color: getPasswordStrengthColor() }}>
                密碼強度：{passwordStrength === 'weak' ? '弱' : passwordStrength === 'medium' ? '中' : '強'}
              </div>
            )}
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
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>
        <p className="switch-text">
          已經有帳號？
          <button 
            className="switch-button" 
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            立即登入
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
