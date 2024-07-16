import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Account.css';

const Account = () => {
    const [otp, setOtp] = useState('');
    const [verified, setVerified] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [currentUsername, setCurrentUsername] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (verified) {
            fetchCurrentUserDetails();
        }
    }, [verified]);

    const fetchCurrentUserDetails = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/account/current`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCurrentUsername(response.data.username);
            setCurrentEmail(response.data.email);
        } catch (error) {
            console.error('Error fetching current user details:', error);
        }
    };

    const generateOTP = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/account/generate-otp`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response.data);
        } catch (error) {
            console.error('Error generating OTP:', error);
        }
    };

    const verifyOTP = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/account/verify-otp`, {
                otp
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setVerified(true);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
        }
    };

    const handleEditAccount = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/account/edit`, {
                newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Account updated successfully:', response);
            navigate('/login'); // Redirect to the login page
        } catch (error) {
            console.error('Error updating account:', error);
        }
    };

    return (
        <div className="account-page-container">
            {!verified ? (
                <div className="otp-verification-form">
                    <h2>Generate OTP</h2>
                    <button onClick={generateOTP}>Send OTP</button>

                    <h2>Enter OTP</h2>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="OTP"
                    />
                    <button onClick={verifyOTP}>Verify OTP</button>
                </div>
            ) : (
                <div className="account-form">
                    <h2>Edit Account</h2>
                    <label>Current Username</label>
                    <input
                        type="text"
                        value={currentUsername}
                        disabled
                    />
                    <label>Current Email</label>
                    <input
                        type="email"
                        value={currentEmail}
                        disabled
                    />
                    <label>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                    />
                    <button onClick={handleEditAccount}>Save Changes</button>
                </div>
            )}
        </div>
    );
};

export default Account;
