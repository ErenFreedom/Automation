import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSensorApis, setThresholds, fetchCurrentThresholds } from '../../actions/sensorActions';
import { fetchAlerts } from '../../actions/notificationActions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye } from 'react-icons/fa';
import './Notifications.css';
import jwtDecode from 'jwt-decode';

const Notifications = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.alerts);
  const sensorApis = useSelector((state) => state.sensors.sensorApis);
  const currentThresholds = useSelector((state) => state.sensors.currentThresholds);
  const [thresholds, setThresholdsState] = useState({});
  const [monitoring, setMonitoring] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const initialFetch = useRef(false);

  const token = localStorage.getItem('authToken');
  const decodedToken = jwtDecode(token);
  const isStaff = decodedToken.department ? true : false; // Determine if user is staff

  useEffect(() => {
    if (!initialFetch.current) {
      dispatch(fetchSensorApis());
      dispatch(fetchCurrentThresholds());
      setLoaded(true);
      initialFetch.current = true;
    }

    const monitoringState = localStorage.getItem('monitoring');
    setMonitoring(monitoringState === 'true');

    const savedThresholds = localStorage.getItem('thresholds');
    if (savedThresholds) {
      setThresholdsState(JSON.parse(savedThresholds));
    } else {
      setThresholdsState(currentThresholds);
    }
  }, [dispatch, currentThresholds]);

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
    console.log('Sending thresholds:', thresholdArray); // Log the thresholds array
    try {
      const url = isStaff ? '/set-thresholds' : '/client-set-thresholds'; // Determine URL based on user type
      await dispatch(setThresholds(thresholdArray, url)); // Pass URL to action
      localStorage.setItem('thresholds', JSON.stringify(thresholds));
      toast.success('Thresholds set successfully!');
    } catch (error) {
      console.error('Error setting thresholds:', error.response ? error.response.data : error.message); // Log the error response
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
