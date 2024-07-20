// src/components/notifications/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSensorApis, setThresholds } from '../../actions/sensorActions';
import axios from 'axios';
import './Notifications.css';

const Notifications = () => {
  const dispatch = useDispatch();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sensorApis = useSelector(state => state.sensors.sensorApis);

  useEffect(() => {
    dispatch(fetchSensorApis());
  }, [dispatch]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAlerts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleSetThresholds = (e) => {
    e.preventDefault();
    const thresholds = sensorApis.map(sensorApi => ({
      sensorApi,
      thresholdValue: document.getElementById(sensorApi).value
    }));
    dispatch(setThresholds(thresholds));
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="notifications-list">
          {alerts.map((alert, index) => (
            <li key={index} className="notification-item">
              <p>Sensor API: {alert.sensor_api}</p>
              <p>Value: {alert.value}</p>
              <p>Timestamp: {new Date(alert.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
      <h2>Set Thresholds</h2>
      <form onSubmit={handleSetThresholds}>
        {sensorApis.map(sensorApi => (
          <div key={sensorApi} className="threshold-input">
            <label htmlFor={sensorApi}>{sensorApi}</label>
            <input type="number" id={sensorApi} name={sensorApi} />
          </div>
        ))}
        <button type="submit">Set Thresholds</button>
      </form>
    </div>
  );
};

export default Notifications;
