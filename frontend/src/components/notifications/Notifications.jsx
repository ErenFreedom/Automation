// src/components/notifications/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlerts } from '../../actions/notificationActions';
import { fetchSensorApis, setThresholds } from '../../actions/sensorActions';
import './Notifications.css';

const Notifications = () => {
  const dispatch = useDispatch();
  const { alerts, loading: alertsLoading, error: alertsError } = useSelector((state) => state.notifications);
  const { sensorApis, loading: sensorsLoading, error: sensorsError } = useSelector((state) => state.sensors);
  const [thresholds, setThresholdsState] = useState([]);

  useEffect(() => {
    dispatch(fetchAlerts());
    dispatch(fetchSensorApis());
  }, [dispatch]);

  const handleThresholdChange = (index, value) => {
    const newThresholds = [...thresholds];
    newThresholds[index].thresholdValue = value;
    setThresholdsState(newThresholds);
  };

  const handleSaveThresholds = () => {
    dispatch(setThresholds({ thresholds }));
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {alertsLoading || sensorsLoading ? (
        <p>Loading...</p>
      ) : alertsError ? (
        <p>Error: {alertsError}</p>
      ) : sensorsError ? (
        <p>Error: {sensorsError}</p>
      ) : (
        <>
          <ul className="notifications-list">
            {alerts.map((alert, index) => (
              <li key={index} className="notification-item">
                <p>Sensor API: {alert.sensorApi}</p>
                <p>Value: {alert.value}</p>
                <p>Timestamp: {new Date(alert.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ul>
          <h3>Set Thresholds</h3>
          <ul className="thresholds-list">
            {sensorApis.map((sensorApi, index) => (
              <li key={index} className="threshold-item">
                <p>Sensor API: {sensorApi}</p>
                <input
                  type="number"
                  value={thresholds[index]?.thresholdValue || ''}
                  onChange={(e) => handleThresholdChange(index, e.target.value)}
                />
              </li>
            ))}
          </ul>
          <button onClick={handleSaveThresholds}>Save Thresholds</button>
        </>
      )}
    </div>
  );
};

export default Notifications;
