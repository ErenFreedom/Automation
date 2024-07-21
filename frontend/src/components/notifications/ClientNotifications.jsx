// src/components/notifications/ClientNotifications.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientSensorApis, setClientThresholds, fetchClientCurrentThresholds } from '../../actions/clientSensorActions';
import { fetchClientAlerts } from '../../actions/clientNotificationActions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye } from 'react-icons/fa';
import './Notifications.css';

const ClientNotifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.clientNotifications.alerts);
  const sensorApis = useSelector((state) => state.clientSensors.sensorApis);
  const currentThresholds = useSelector((state) => state.clientSensors.currentThresholds);
  const [thresholds, setThresholdsState] = useState({});
  const [monitoring, setMonitoring] = useState(false);

  // Fetch sensor APIs and current thresholds only once when the component mounts
  useEffect(() => {
    if (sensorApis.length === 0) {
      dispatch(fetchClientSensorApis());
    }
    if (Object.keys(currentThresholds).length === 0) {
      dispatch(fetchClientCurrentThresholds());
    }
  }, [dispatch, sensorApis.length, currentThresholds]);

  useEffect(() => {
    const monitoringState = localStorage.getItem('clientMonitoring');
    setMonitoring(monitoringState === 'true');

    const savedThresholds = localStorage.getItem('clientThresholds');
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
        dispatch(fetchClientAlerts());
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
      await dispatch(setClientThresholds({ thresholds: thresholdArray }));
      localStorage.setItem('clientThresholds', JSON.stringify(thresholds));
      toast.success('Thresholds set successfully!');
    } catch (error) {
      toast.error('Failed to set thresholds.');
    }
  };

  const handleThresholdChange = (sensorApi, value) => {
    setThresholdsState((prevThresholds) => {
      const newThresholds = { ...prevThresholds, [sensorApi]: value };
      localStorage.setItem('clientThresholds', JSON.stringify(newThresholds));
      return newThresholds;
    });
  };

  const handleMonitorToggle = () => {
    const newMonitoringState = !monitoring;
    setMonitoring(newMonitoringState);
    if (newMonitoringState) {
      dispatch(fetchClientAlerts());
    }
    localStorage.setItem('clientMonitoring', newMonitoringState);
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

export default ClientNotifications;
