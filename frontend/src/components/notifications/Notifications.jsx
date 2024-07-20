// src/components/notifications/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, fetchSensorApis, setThresholds } from '../../actions/sensorActions';
import './Notifications.css';

const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.notifications);
  const sensorApis = useSelector((state) => state.sensors.sensorApis);
  const [thresholds, setThresholdsState] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(fetchSensorApis());
    setLoading(false);
  }, [dispatch]);

  const handleSetThresholds = (e) => {
    e.preventDefault();
    const thresholdArray = Object.keys(thresholds).map(sensorApi => ({
      sensorApi,
      thresholdValue: thresholds[sensorApi]
    }));
    dispatch(setThresholds({ thresholds: thresholdArray }));
  };

  const handleThresholdChange = (sensorApi, value) => {
    setThresholdsState((prevThresholds) => ({
      ...prevThresholds,
      [sensorApi]: value
    }));
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ul className="notifications-list">
            {notifications && notifications.map((alert, index) => (
              <li key={index} className="notification-item">
                <p>Sensor API: {alert.sensorApi}</p>
                <p>Value: {alert.value}</p>
                <p>Timestamp: {new Date(alert.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
          <h2>Set Thresholds</h2>
          <form onSubmit={handleSetThresholds}>
            {Array.isArray(sensorApis) && sensorApis.map(sensorApi => (
              <div key={sensorApi} className="threshold-input">
                <label htmlFor={sensorApi}>{sensorApi}</label>
                <input 
                  type="number" 
                  id={sensorApi} 
                  name={sensorApi} 
                  value={thresholds[sensorApi] || ''} 
                  onChange={(e) => handleThresholdChange(sensorApi, e.target.value)} 
                />
              </div>
            ))}
            <button type="submit">Set Thresholds</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Notifications;
