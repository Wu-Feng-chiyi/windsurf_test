import React, { useState } from 'react';
import MapSearch from '../components/map/MapSearch';
import './MapSearchPage.css';

const MapSearchPage = () => {
  const [filters, setFilters] = useState({
    searchText: '',
    transactionType: '',
    propertyType: '',
    priceRange: '',
    rooms: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="map-search-page">
      <div className="map-search-container">
        <div className="search-sidebar">
          <h2>地圖找房</h2>
          <div className="search-filters">
            <input
              type="text"
              name="searchText"
              placeholder="搜尋地址..."
              className="search-input"
              value={filters.searchText}
              onChange={handleFilterChange}
            />
            <select
              name="transactionType"
              className="filter-select"
              value={filters.transactionType}
              onChange={handleFilterChange}
            >
              <option value="">交易類型</option>
              <option value="rent">租屋</option>
              <option value="sale">買賣</option>
            </select>
            <select
              name="propertyType"
              className="filter-select"
              value={filters.propertyType}
              onChange={handleFilterChange}
            >
              <option value="">房屋類型</option>
              <option value="apartment">公寓</option>
              <option value="house">透天厝</option>
              <option value="building">大廈</option>
            </select>
            <select
              name="priceRange"
              className="filter-select"
              value={filters.priceRange}
              onChange={handleFilterChange}
            >
              <option value="">價格範圍</option>
              <option value="0-10000">10,000以下</option>
              <option value="10000-20000">10,000-20,000</option>
              <option value="20000-30000">20,000-30,000</option>
              <option value="30000+">30,000以上</option>
            </select>
            <select
              name="rooms"
              className="filter-select"
              value={filters.rooms}
              onChange={handleFilterChange}
            >
              <option value="">房型</option>
              <option value="1">1房</option>
              <option value="2">2房</option>
              <option value="3">3房</option>
              <option value="4+">4房以上</option>
            </select>
          </div>
          <div className="search-results">
            {/* 這裡可以添加搜索結果列表 */}
          </div>
        </div>
        <div className="map-container">
          <MapSearch />
        </div>
      </div>
    </div>
  );
};

export default MapSearchPage;
