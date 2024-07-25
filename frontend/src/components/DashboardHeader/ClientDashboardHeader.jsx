import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import logo from '../../assets/logo.png';
import './DashboardHeader.css';

const ClientDashboardHeader = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/account/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem('authToken');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/account/generate-otp`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.location.href = `/otp-account?userId=${userId}`;
    } catch (error) {
      console.error('Error generating OTP:', error);
    }
  };

  const handleNotificationClick = () => {
    console.log('Bell icon clicked. Navigating to notifications...');
    navigate('/client-notifications');
  };

  return (
    <div className="dashboard-header-container">
      <div className="dashboard-logo-container">
        <img src={logo} className="dashboard-logo" alt="Platform Logo" />
        <h1 className="intelli-monitor-heading">IntelliMonitor</h1>
      </div>
      <div className="dashboard-header-options">
        <div className="dashboard-query-button">
          <Link to={`/raise-query/${userId}`}>
            <button className="dashboard-button">Raise a Query</button>
          </Link>
        </div>
        <div className="dashboard-report-button">
          <Link to={`/report/${userId}`}>
            <button className="dashboard-button">Generate Report</button>
          </Link>
        </div>
        <div className="dashboard-report-button">
          <Link to="/sensor-tags">
            <button className="dashboard-button">Configure Sensor Tags</button>
          </Link>
        </div>
        <div className="dashboard-notification-dropdown">
          <FaBell className="dashboard-icon" onClick={handleNotificationClick} />
        </div>
        <div className="dashboard-profile-dropdown">
          <FaUserCircle className="dashboard-icon" />
          <div className="dashboard-dropdown-content">
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardHeader;
