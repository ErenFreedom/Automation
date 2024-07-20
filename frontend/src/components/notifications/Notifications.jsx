// src/components/notifications/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSensorApis, setThresholds } from '../../actions/sensorActions';
import { fetchAlerts } from '../../actions/notificationActions';
import './Notifications.css';

const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.alerts);
  const sensorApis = useSelector((state) => state.sensors.sensorApis);
  const [thresholds, setThresholdsState] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const handleMonitorNow = () => {
    dispatch(fetchAlerts());
    const interval = setInterval(() => {
      dispatch(fetchAlerts());
    }, 60000); // Fetch alerts every 60 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  };

  return (
    <div className="notifications-container">
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
        <button className="set-thresholds-button" type="submit">Set Thresholds</button>
      </form>
      <button className="monitor-button" onClick={handleMonitorNow}>Monitor Now</button>
      <h2>Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="notifications-list">
          {Array.isArray(notifications) && notifications.map((alert, index) => (
            <div key={index} className="notification-item">
              <p>Sensor API: {alert.sensorApi}</p>
              <p>Value: {alert.value}</p>
              <p>Timestamp: {new Date(alert.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
