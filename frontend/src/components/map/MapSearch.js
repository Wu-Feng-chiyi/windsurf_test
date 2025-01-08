import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './MapSearch.css';

const MapSearch = () => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({
    lat: 25.0330,
    lng: 121.5654
  });
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const containerStyle = {
    width: '100%',
    height: '100%'
  };

  const mapOptions = {
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true
  };

  // 模擬房屋資料
  useEffect(() => {
    const dummyData = [
      {
        id: 1,
        position: { lat: 25.0330, lng: 121.5654 },
        title: "台北市中心豪華公寓",
        price: "NT$ 35,000",
        address: "台北市信義區信義路"
      },
      {
        id: 2,
        position: { lat: 25.0400, lng: 121.5700 },
        title: "信義區精緻套房",
        price: "NT$ 28,000",
        address: "台北市信義區松仁路"
      },
      {
        id: 3,
        position: { lat: 25.0280, lng: 121.5600 },
        title: "大安區三房公寓",
        price: "NT$ 45,000",
        address: "台北市大安區和平東路"
      }
    ];
    setMarkers(dummyData);
  }, []);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, [center]);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return (
    <div className="map-component" style={{ height: '100%', width: '100%' }}>
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        loadingElement={<div>Loading...</div>}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              onClick={() => setSelectedMarker(marker)}
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="info-window">
                <h3>{selectedMarker.title}</h3>
                <p className="price">{selectedMarker.price}</p>
                <p className="address">{selectedMarker.address}</p>
                <button className="view-details">查看詳情</button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapSearch;
