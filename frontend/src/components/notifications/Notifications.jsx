// src/components/notifications/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSensorApis, setThresholds } from '../../actions/sensorActions';
import { fetchAlerts } from '../../actions/notificationActions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye } from 'react-icons/fa';
import axios from 'axios';
import './Notifications.css';

const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.alerts);
  const sensorApis = useSelector((state) => state.sensors.sensorApis);
  const [thresholds, setThresholdsState] = useState({});
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    dispatch(fetchSensorApis());
    setLoading(false);

    const monitoringState = localStorage.getItem('monitoring');
    if (monitoringState === 'true') {
      setMonitoring(true);
    }

    // Fetch current thresholds from the backend
    const fetchCurrentThresholds = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/current-thresholds`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const currentThresholds = response.data;
        setThresholdsState(currentThresholds);
      } catch (error) {
        console.error('Error fetching current thresholds:', error);
      }
    };

    fetchCurrentThresholds();
  }, [dispatch]);

  useEffect(() => {
    if (monitoring) {
      const interval = setInterval(() => {
        dispatch(fetchAlerts());
      }, 60000); // Fetch alerts every 60 seconds

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
      toast.success('Thresholds set successfully!');
    } catch (error) {
      toast.error('Failed to set thresholds.');
    }
  };

  const handleThresholdChange = (sensorApi, value) => {
    setThresholdsState((prevThresholds) => ({
      ...prevThresholds,
      [sensorApi]: value
    }));
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
              value={thresholds[sensorApi] || ''} 
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
      {loading ? (
        <p>Loading...</p>
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
