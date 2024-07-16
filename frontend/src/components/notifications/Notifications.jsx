// src/components/notifications/Notifications.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Notifications.css';

const Notifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/alerts`, {
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

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="notifications-list">
          {alerts.map((alert, index) => (
            <li key={index} className="notification-item">
              <p>Table: {alert.table}</p>
              <p>Value: {alert.value}</p>
              <p>Timestamp: {new Date(alert.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
