// src/components/notifications/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSensorApis, setThresholds, fetchCurrentThresholds } from '../../actions/sensorActions';
import { fetchAlerts } from '../../actions/notificationActions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye } from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.alerts);
  const sensorApis = useSelector((state) => state.sensors.sensorApis);
  const currentThresholds = useSelector((state) => state.sensors.currentThresholds);
  const [thresholds, setThresholdsState] = useState({});
  const [monitoring, setMonitoring] = useState(false);

  // Fetch sensor APIs and current thresholds only once when the component mounts
  useEffect(() => {
    if (sensorApis.length === 0) {
      dispatch(fetchSensorApis());
    }
    if (Object.keys(currentThresholds).length === 0) {
      dispatch(fetchCurrentThresholds());
    }
  }, [dispatch, sensorApis.length, currentThresholds]);

  useEffect(() => {
    const monitoringState = localStorage.getItem('monitoring');
    setMonitoring(monitoringState === 'true');

    const savedThresholds = localStorage.getItem('thresholds');
    if (savedThresholds) {
      setThresholdsState(JSON.parse(savedThresholds));
    } else {
      setThresholdsState(currentThresholds);
    }
  }, [currentThresholds]);

  // Set an interval for fetching alerts only when monitoring is active
  useEffect(() => {
    let interval;
    if (monitoring) {
      interval = setInterval(() => {
        dispatch(fetchAlerts());
      }, 120000); // Fetch alerts every 2 minutes

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [monitoring, dispatch]);

  const handleSetThresholds = async (e) => {
    e.preventDefault();
    const thresholdArray = Object.keys(thresholds).map(sensorApi => ({
      sensorApi,
      thresholdValue: thresholds[sensorApi]
    }));
    try {
      await dispatch(setThresholds({ thresholds: thresholdArray }));
      localStorage.setItem('thresholds', JSON.stringify(thresholds));
      toast.success('Thresholds set successfully!');
    } catch (error) {
      toast.error('Failed to set thresholds.');
    }
  };

  const handleThresholdChange = (sensorApi, value) => {
    setThresholdsState((prevThresholds) => {
      const newThresholds = { ...prevThresholds, [sensorApi]: value };
      localStorage.setItem('thresholds', JSON.stringify(newThresholds));
      return newThresholds;
    });
  };

  const handleMonitorToggle = () => {
    const newMonitoringState = !monitoring;
    setMonitoring(newMonitoringState);
    if (newMonitoringState) {
      dispatch(fetchAlerts());
    }
    localStorage.setItem('monitoring', newMonitoringState);
  };

  return (
    <div className="notifications-container">
      <ToastContainer />
      <h2>Set Thresholds</h2>
      <form onSubmit={handleSetThresholds}>
        {Array.isArray(sensorApis) && sensorApis.map(sensorApi => (
          <div key={sensorApi} className="threshold-input">
            <label htmlFor={sensorApi}>{sensorApi}</label>
            <input 
              type="number" 
              id={sensorApi} 
              name={sensorApi} 
              value={thresholds[sensorApi] || currentThresholds[sensorApi] || ''} 
              onChange={(e) => handleThresholdChange(sensorApi, e.target.value)} 
            />
          </div>
        ))}
        <button className="set-thresholds-button" type="submit">Set Thresholds</button>
      </form>
      <button className="monitor-button" onClick={handleMonitorToggle}>
        {monitoring ? 'Stop Monitoring' : 'Monitor Now'}
      </button>
      {monitoring && <FaEye className="monitoring-icon" />}
      <h2>Notifications</h2>
      {Object.keys(notifications).length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <div className="notifications-list">
          {Object.keys(notifications).map((sensorApi, index) => (
            notifications[sensorApi].map((alert, idx) => (
              <div key={`${index}-${idx}`} className="notification-item">
                <p><strong>Sensor API:</strong> {sensorApi}</p>
                <p><strong>Value:</strong> {alert.value}</p>
                <p><strong>Timestamp:</strong> {new Date(alert.timestamp).toLocaleString()}</p>
                <p><strong>Message:</strong> {alert.message}</p>
              </div>
            ))
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
