import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import RegisterClientPage from './components/RegisterPage/ClientRegisterPage';
import LoginPage from './components/LoginPage/LoginPage';
import ClientLoginPage from './components/LoginPage/ClientLoginPage';
import OtpPage from './components/OtpPage/OtpPage';
import OtpLoginPage from './components/OtpPage/otpLoginPage';
import ClientOtpLoginPage from './components/OtpPage/ClientOtpLoginPage';
import OtpAccountPage from './components/OtpPage/otpAccountPage'; 
import OtpPageClient from './components/OtpPage/OtpPageClient';
import DashboardPage from './components/DashboardPage/DashboardPage';
import ClientDashboardPage from './components/DashboardPage/ClientDashboardPage'; // Import ClientDashboardPage
import Temperature from './components/ConfigTabs/Temperature';
import Pressure from './components/ConfigTabs/Pressure';
import Rh from './components/ConfigTabs/Rh';
import Humidity from './components/ConfigTabs/Humidity';
import Report from './components/report/Report';
import Account from './components/account/Account';
import Notifications from './components/notifications/Notifications'; 
import RaiseQuery from './components/ClientQuery/RaiseQuery'; // Import RaiseQuery
import ClientQueryStatus from './components/ClientQuery/clientQueryStatus'; // Import ClientQueryStatus
import StaffQueryView from './components/StaffQuery/StaffQueryView'; // Import StaffQueryView

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-client" element={<RegisterClientPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-client" element={<ClientLoginPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/otp-login" element={<OtpLoginPage />} />
        <Route path="/client-otp-login" element={<ClientOtpLoginPage />} />
        <Route path="/otp-account" element={<OtpAccountPage />} /> 
        <Route path="/otp-client" element={<OtpPageClient />} /> 
        <Route path="/dashboard/:userId" element={<DashboardPage />} />
        <Route path="/client-dashboard/:userId" element={<ClientDashboardPage />} /> {/* Add route for ClientDashboardPage */}
        <Route path="/temperature/:userId" element={<Temperature />} />
        <Route path="/pressure/:userId" element={<Pressure />} />
        <Route path="/rh/:userId" element={<Rh />} />
        <Route path="/humidity/:userId" element={<Humidity />} />
        <Route path="/report/:userId" element={<Report />} />
        <Route path="/edit-account/:userId" element={<Account />} />
        <Route path="/notifications" element={<Notifications />} /> 
        <Route path="/raise-query/:userId" element={<RaiseQuery />} /> {/* Add route for RaiseQuery */}
        <Route path="/query-status/:userId" element={<ClientQueryStatus />} /> {/* Add route for ClientQueryStatus */}
        <Route path="/staff-queries/:userId" element={<StaffQueryView />} /> {/* Add route for StaffQueryView */}
      </Routes>
    </Router>
  );
}

export default App;
