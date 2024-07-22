import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import ReactModal from 'react-modal';
import './Notifications.css';

ReactModal.setAppElement('#root');

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [sensorApis, setSensorApis] = useState([]);
  const [currentThresholds, setCurrentThresholds] = useState({});
  const [thresholds, setThresholdsState] = useState({});
  const [monitoring, setMonitoring] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const initialFetch = useRef(false);

  const token = localStorage.getItem('authToken');
  const decodedToken = jwtDecode(token);
  const isStaff = decodedToken.department ? true : false; // Determine if user is staff

  const getApiUrl = (endpoint) => {
    return isStaff ? `${process.env.REACT_APP_API_URL}/${endpoint}` : `${process.env.REACT_APP_API_URL}/client-${endpoint}`;
  };

  useEffect(() => {
    if (!initialFetch.current) {
      fetchSensorApis();
      fetchCurrentThresholds();
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
      localStorage.setItem('thresholds', JSON.stringify(thresholds));
      toast.success('Thresholds set successfully!');
      closeModal();
    } catch (error) {
      console.error('Error setting thresholds:', error.response ? error.response.data : error.message);
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
      fetchAlerts();
    }
    localStorage.setItem('monitoring', newMonitoringState);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <div className="notifications-container">
      <ToastContainer />
      <h2>Set Thresholds</h2>
      <form>
        {Array.isArray(sensorApis) && sensorApis.map(sensorApi => (
          <div key={sensorApi} className="threshold-input">
            <label htmlFor={sensorApi}>{sensorApi}</label>
            <input
              type="text"
              id={sensorApi}
              name={sensorApi}
              value={currentThresholds[sensorApi] || ''}
              disabled
            />
          </div>
        ))}
      </form>
      <button onClick={openModal} className="update-thresholds-button">Update Threshold Values</button>
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Update Threshold Values"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>Update Threshold Values</h2>
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
          <button className="set-thresholds-button" type="submit">Apply Changes</button>
        </form>
        <button onClick={closeModal} className="close-modal-button">Close</button>
      </ReactModal>
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
