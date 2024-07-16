import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import LoginPage from './components/LoginPage/LoginPage';
import OtpPage from './components/OtpPage/OtpPage';
import DashboardPage from './components/DashboardPage/DashboardPage';
import Temperature from './components/ConfigTabs/Temperature';
import Pressure from './components/ConfigTabs/Pressure';
import Rh from './components/ConfigTabs/Rh';
import Humidity from './components/ConfigTabs/Humidity';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/dashboard/:userId" element={<DashboardPage />} />
        <Route path="/temperature/:userId" element={<Temperature />} />
        <Route path="/pressure/:userId" element={<Pressure />} />
        <Route path="/rh/:userId" element={<Rh />} />
        <Route path="/humidity/:userId" element={<Humidity />} />
      </Routes>
    </Router>
  );
}

export default App;
