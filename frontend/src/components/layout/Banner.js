import React, { useState, useEffect } from 'react';
import './Banner.css';

const bannerImages = [
  {
    url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
    title: '尋找您的理想住宅',
    subtitle: '數千間優質房源，讓您安心選擇'
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
    title: '豪宅精選',
    subtitle: '高端住宅，品味生活'
  },
  {
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80',
    title: '租屋好選擇',
    subtitle: '嚴選房源，安心租屋'
  }
];

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 自動輪播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // 切換到指定幻燈片
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // 上一張
  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? bannerImages.length - 1 : prev - 1
    );
  };

  // 下一張
  const nextSlide = () => {
    setCurrentSlide((prev) => 
      (prev + 1) % bannerImages.length
    );
  };

  return (
    <div className="banner">
      <div className="banner-slider">
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image.url})` }}
          >
            <div className="banner-content">
              <h2>{image.title}</h2>
              <p>{image.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="banner-nav prev" onClick={prevSlide}>
        <i className="fas fa-chevron-left"></i>
      </button>
      <button className="banner-nav next" onClick={nextSlide}>
        <i className="fas fa-chevron-right"></i>
      </button>

      <div className="banner-dots">
        {bannerImages.map((_, index) => (
          <button
            key={index}
            className={`banner-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
