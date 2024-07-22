// src/components/notifications/ClientNotifications.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import './Notifications.css';

const ClientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [sensorApis, setSensorApis] = useState([]);
  const [currentThresholds, setCurrentThresholds] = useState({});
  const [thresholds, setThresholdsState] = useState({});
  const [monitoring, setMonitoring] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const initialFetch = useRef(false);

  const token = localStorage.getItem('authToken');
  const decodedToken = jwtDecode(token);
  const isClient = !decodedToken.department; // Determine if user is client

  const getApiUrl = (endpoint) => {
    return isClient ? `${process.env.REACT_APP_API_URL}/client-${endpoint}` : `${process.env.REACT_APP_API_URL}/${endpoint}`;
  };

  useEffect(() => {
    if (!initialFetch.current) {
      fetchSensorApis();
      fetchCurrentThresholds();
      setLoaded(true);
      initialFetch.current = true;
    }

    const monitoringState = localStorage.getItem('clientMonitoring');
    setMonitoring(monitoringState === 'true');

    const savedThresholds = localStorage.getItem('clientThresholds');
    if (savedThresholds) {
      setThresholdsState(JSON.parse(savedThresholds));
    } else {
      setThresholdsState(currentThresholds);
    }
  }, [currentThresholds]);

  useEffect(() => {
    let interval;
    if (monitoring) {
      interval = setInterval(() => {
        fetchAlerts();
      }, 120000); // Fetch alerts every 2 minutes

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [monitoring]);

  const fetchSensorApis = async () => {
    try {
      const response = await axios.get(getApiUrl('sensor-apis'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched sensor APIs:', response.data);
      setSensorApis(response.data);
    } catch (error) {
      console.error('Error fetching sensor APIs:', error.message);
    }
  };

  const fetchCurrentThresholds = async () => {
    try {
      const response = await axios.get(getApiUrl('current-thresholds'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched current thresholds:', response.data);
      setCurrentThresholds(response.data);
    } catch (error) {
      console.error('Error fetching current thresholds:', error.message);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(getApiUrl('get-notifications'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched notifications:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error.message);
    }
  };

  const handleSetThresholds = async (e) => {
    e.preventDefault();
    const thresholdArray = Object.keys(thresholds).map(sensorApi => ({
      sensorApi,
      thresholdValue: thresholds[sensorApi]
    }));
    console.log('Sending thresholds:', thresholdArray);
    try {
      await axios.post(getApiUrl('set-thresholds'), { thresholds: thresholdArray }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      localStorage.setItem('clientThresholds', JSON.stringify(thresholds));
      toast.success('Thresholds set successfully!');
    } catch (error) {
      console.error('Error setting thresholds:', error.response ? error.response.data : error.message);
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
      fetchAlerts();
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
