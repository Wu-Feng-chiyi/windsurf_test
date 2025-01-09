import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ 
  isLoggedIn, 
  userInfo, 
  showUserMenu, 
  setShowUserMenu, 
  setShowLoginModal, 
  setShowRegisterModal, 
  handleLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle Mobile Menu"
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <div className="header-left">
          <Link to="/" className="logo">
            <h1>房市集</h1>
          </Link>
        </div>

        <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <div className="nav-group main-nav">
            <Link to="/buy" className="nav-link">
              <i className="fas fa-home"></i>
              <span>買房</span>
            </Link>
            <Link to="/rent" className="nav-link">
              <i className="fas fa-key"></i>
              <span>租房</span>
            </Link>
            <Link to="/map" className="nav-link">
              <i className="fas fa-map-marked-alt"></i>
              <span>地圖找房</span>
            </Link>
            <Link to="/price" className="nav-link">
              <i className="fas fa-chart-line"></i>
              <span>實價登錄</span>
            </Link>
            <Link to="/news" className="nav-link">
              <i className="fas fa-newspaper"></i>
              <span>新聞資訊</span>
            </Link>
          </div>

          <div className="nav-group auth-nav">
            <div 
              className="post-menu"
              onMouseEnter={() => setShowPostMenu(true)}
              onMouseLeave={() => setShowPostMenu(false)}
            >
              <button className="post-button">
                <i className="fas fa-plus-circle"></i>
                <span>我要刊登</span>
              </button>
              {showPostMenu && (
                <div className="post-menu-dropdown">
                  <Link to="/post/sell" className="menu-item">
                    <i className="fas fa-home"></i>
                    我要賣房
                  </Link>
                  <Link to="/post/rent" className="menu-item">
                    <i className="fas fa-key"></i>
                    我要出租
                  </Link>
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <div className="user-menu">
                <button 
                  className="user-menu-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <i className="fas fa-user-circle"></i>
                  <span>{userInfo?.name || '用戶'}</span>
                </button>
                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <Link to="/favorites" className="menu-item">
                      <i className="fas fa-heart"></i>
                      我的收藏
                    </Link>
                    <Link to="/profile" className="menu-item">
                      <i className="fas fa-user"></i>
                      個人資料
                    </Link>
                    <button 
                      className="menu-item logout" 
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      登出
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="auth-button login" 
                  onClick={() => setShowLoginModal(true)}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>登入</span>
                </button>
                <button 
                  className="auth-button register" 
                  onClick={() => setShowRegisterModal(true)}
                >
                  <i className="fas fa-user-plus"></i>
                  <span>註冊</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
