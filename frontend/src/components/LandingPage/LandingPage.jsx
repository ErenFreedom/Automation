import React, { useState } from 'react';
import './LandingPage.css';
import { FaGithub, FaInstagram, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import newGif from '../../assets/animated_image.gif'; // Update with the new GIF path

const LandingPage = () => {
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  const handleRegisterMouseEnter = () => {
    setShowRegisterDropdown(true);
  };

  const handleRegisterMouseLeave = () => {
    setShowRegisterDropdown(false);
  };

  const handleLoginMouseEnter = () => {
    setShowLoginDropdown(true);
  };

  const handleLoginMouseLeave = () => {
    setShowLoginDropdown(false);
  };

  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo-container">
          <img src={logo} className="logo" alt="IntelliMonitor Logo" />
          <h1 className="app-name">IntelliMonitor</h1>
        </div>
        <div className="nav-buttons">
          <div 
            className="dropdown"
            onMouseEnter={handleLoginMouseEnter}
            onMouseLeave={handleLoginMouseLeave}
          >
            <button className="nav-button">Login</button>
            {showLoginDropdown && (
              <div className="dropdown-content">
                <Link to="/login">
                  <div className="dropdown-item">Login as Staff</div>
                </Link>
                <Link to="/login-client">
                  <div className="dropdown-item">Login as Client</div>
                </Link>
              </div>
            )}
          </div>
          <div 
            className="dropdown"
            onMouseEnter={handleRegisterMouseEnter}
            onMouseLeave={handleRegisterMouseLeave}
          >
            <button className="nav-button">Register</button>
            {showRegisterDropdown && (
              <div className="dropdown-content">
                <Link to="/register">
                  <div className="dropdown-item">Register as Staff</div>
                </Link>
                <Link to="/register-client">
                  <div className="dropdown-item">Register as Client</div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="main-content">
        <img src={newGif} className="animation-image" alt="Animated IoT" />
      </main>
      <footer className="footer">
        <p>Contact Us</p>
        <div className="icon-container">
          <a href="https://github.com/ErenFreedom" target="_blank" rel="noopener noreferrer" className="icon"><FaGithub /></a>
          <a href="https://instagram.com/yeagerist1730" target="_blank" rel="noopener noreferrer" className="icon"><FaInstagram /></a>
          <a href="mailto:freedomyeager12@gmail.com" target="_blank" rel="noopener noreferrer" className="icon"><FaEnvelope /></a>
        </div>
        <p className="footer-text">© 2024 IntelliMonitor. All rights reserved.™</p>
      </footer>
    </div>
  );
};

export default LandingPage;
