import React, { useState } from 'react';
import './App.css';
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import { useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Banner from './components/layout/Banner';

// 台灣縣市資料
const TAIWAN_CITIES = [
  {
    city: '台北市',
    districts: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區']
  },
  {
    city: '新北市',
    districts: ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '樹林區', '鶯歌區', '三峽區', '淡水區', '汐止區', '瑞芳區']
  },
  {
    city: '桃園市',
    districts: ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '龜山區', '龍潭區', '大溪區', '大園區']
  },
  {
    city: '台中市',
    districts: ['中區', '東區', '南區', '西區', '北區', '北屯區', '西屯區', '南屯區', '太平區', '大里區', '霧峰區']
  },
  {
    city: '台南市',
    districts: ['中西區', '東區', '南區', '北區', '安平區', '安南區', '永康區', '仁德區', '歸仁區', '新化區']
  },
  {
    city: '高雄市',
    districts: ['楠梓區', '左營區', '鼓山區', '三民區', '苓雅區', '前金區', '新興區', '前鎮區', '旗津區', '小港區']
  }
];

// 房屋類型
const HOUSE_TYPES = [
  { value: 'apartment', label: '公寓' },
  { value: 'building', label: '大廈' },
  { value: 'house', label: '透天厝' },
  { value: 'studio', label: '套房' },
  { value: 'villa', label: '別墅' },
  { value: 'store', label: '店面' },
  { value: 'office', label: '辦公室' },
  { value: 'factory', label: '廠房' },
  { value: 'land', label: '土地' }
];

// 價格範圍選項
const PRICE_RANGES = {
  sale: [
    { value: '0-500', label: '500萬以下' },
    { value: '500-1000', label: '500-1000萬' },
    { value: '1000-2000', label: '1000-2000萬' },
    { value: '2000-3000', label: '2000-3000萬' },
    { value: '3000-5000', label: '3000-5000萬' },
    { value: '5000-', label: '5000萬以上' }
  ],
  rent: [
    { value: '0-10000', label: '1萬以下' },
    { value: '10000-20000', label: '1-2萬' },
    { value: '20000-30000', label: '2-3萬' },
    { value: '30000-50000', label: '3-5萬' },
    { value: '50000-100000', label: '5-10萬' },
    { value: '100000-', label: '10萬以上' }
  ]
};

function App() {
  const { user, logout, initialized } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    type: 'all',
    city: '',
    district: '',
    priceRange: 'all',
    purpose: 'all',
    area: 'all',
    rooms: 'all'
  });

  // 認證相關狀態
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 根據選擇的城市獲取區域列表
  const getDistricts = () => {
    const cityData = TAIWAN_CITIES.find(c => c.city === searchParams.city);
    return cityData ? cityData.districts : [];
  };

  // 模擬數據
  const mockProperties = [
    {
      id: 1,
      title: '信義區豪華公寓',
      price: 15800000,
      address: '台北市信義區信義路五段',
      type: '公寓',
      area: 35.5,
      rooms: 3,
      bathrooms: 2,
      purpose: 'sale',
      image: 'https://via.placeholder.com/300x200'
    },
    {
      id: 2,
      title: '大安區優質套房',
      price: 25000,
      address: '台北市大安區忠孝東路',
      type: '套房',
      area: 18.2,
      rooms: 1,
      bathrooms: 1,
      purpose: 'rent',
      image: 'https://via.placeholder.com/300x200'
    }
  ];

  React.useEffect(() => {
    // 暫時使用模擬數據
    try {
      setLoading(true);
      setProperties(mockProperties);
      setLoading(false);
    } catch (err) {
      setError('無法載入房產資料');
      setLoading(false);
    }
  }, []);

  const formatPrice = (price, purpose) => {
    if (purpose === 'rent') {
      return `${price.toLocaleString()} 元/月`;
    }
    return `${(price/10000).toFixed(0)} 萬`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: 實現搜索邏輯
    console.log('Search params:', searchParams);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // 如果認證狀態還未初始化完成，返回 null 或顯示加載指示器
  if (!initialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        isLoggedIn={!!user}
        userInfo={user}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        setShowLoginModal={setShowLoginModal}
        setShowRegisterModal={setShowRegisterModal}
        handleLogout={() => {
          logout();
          setShowUserMenu(false);
        }}
      />

      <main className="main-content">
        {/* 添加 Banner 組件 */}
        <Banner />

        {/* 搜索區域 */}
        <section className="search-section">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-row">
              <div className="search-group">
                <label>類型</label>
                <select
                  value={searchParams.type}
                  onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                >
                  <option value="all">所有類型</option>
                  {HOUSE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="search-group">
                <label>城市</label>
                <select
                  value={searchParams.city}
                  onChange={(e) => setSearchParams({ 
                    ...searchParams, 
                    city: e.target.value,
                    district: '' // 重置區域
                  })}
                >
                  <option value="">選擇城市</option>
                  {TAIWAN_CITIES.map(city => (
                    <option key={city.city} value={city.city}>{city.city}</option>
                  ))}
                </select>
              </div>

              <div className="search-group">
                <label>區域</label>
                <select
                  value={searchParams.district}
                  onChange={(e) => setSearchParams({ ...searchParams, district: e.target.value })}
                  disabled={!searchParams.city}
                >
                  <option value="">選擇區域</option>
                  {getDistricts().map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div className="search-group">
                <label>價格範圍</label>
                <select
                  value={searchParams.priceRange}
                  onChange={(e) => setSearchParams({ ...searchParams, priceRange: e.target.value })}
                >
                  <option value="all">所有價格</option>
                  {PRICE_RANGES[searchParams.purpose === 'rent' ? 'rent' : 'sale'].map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="search-button">
                <i className="fas fa-search"></i>
                搜尋
              </button>
            </div>
          </form>
        </section>

        {/* 房產列表 */}
        <section className="properties-section">
          {loading ? (
            <div className="loading">載入中...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="properties-grid">
              {properties.map(property => (
                <div key={property.id} className="property-card">
                  <div className="property-image">
                    <img src={property.image} alt={property.title} />
                  </div>
                  <div className="property-info">
                    <h3>{property.title}</h3>
                    <p className="price">{formatPrice(property.price, property.purpose)}</p>
                    <p className="address">{property.address}</p>
                    <div className="property-details">
                      <span>{property.area} 坪</span>
                      <span>{property.rooms} 房</span>
                      <span>{property.bathrooms} 衛</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 登入和註冊彈窗 */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={() => {
            setShowLoginModal(false);
            setShowRegisterModal(true);
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onSwitchToLogin={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
