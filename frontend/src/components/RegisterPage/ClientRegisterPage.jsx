import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import './ClientRegisterPage.css';
import logo from '../../assets/logo.png';
import firstImage from '../../assets/image1.jpg';
import secondImage from '../../assets/image2.jpg';
import thirdImage from '../../assets/image3.jpg';

const ClientRegisterPage = () => {
  const images = [firstImage, secondImage, thirdImage];
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    gender: '',
    age: '',
    phoneNumber: '',
    country: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('register-page-body');
    return () => {
      document.body.classList.remove('register-page-body');
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value, country) => {
    setFormData({
      ...formData,
      phoneNumber: value,
      country: country.name
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/register-client`, formData);
      setMessage(response.data);
      navigate('/otp-client', { state: { email: formData.email } }); // Navigate to the OTP page on successful registration
    } catch (error) {
      setError(error.response?.data || 'An error occurred');
    }
  };

  return (
    <div className="register-page">
      <div className="header-container">
        <div className="logo-container">
          <img src={logo} className="logo" alt="Platform Logo" />
        </div>
        <h1>Welcome to Our Platform - Register Now!</h1>
      </div>
      <div className="register-content">
        <div className="register-form-container">
          <h2>Create an account</h2>
          <form className="register-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Enter your username" required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
            </label>
            <label>
              Password
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
            </label>
            <label>
              Name
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
            </label>
            <label>
              Gender
              <select name="gender" value={formData.gender} onChange={handleChange} required className="styled-select">
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="transgender">Transgender</option>
                <option value="bigender">Bigender</option>
                <option value="genderfluid">Gender Fluid</option>
                <option value="nonbinary">Non-Binary</option>
                <option value="others">Others</option>
              </select>
            </label>
            <label>
              Age
              <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Enter your age" required />
            </label>
            <label>
              Phone Number
              <PhoneInput
                country={'us'}
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phoneNumber',
                  required: true,
                  autoFocus: true
                }}
              />
            </label>
            <button type="submit">Create</button>
          </form>
          {error && <p className="error">{error}</p>}
          {message && <p className="message">{message}</p>}
          <p className="login-link">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
        <div className="slideshow-container">
          <img src={images[currentImage]} alt="Slideshow" className="slideshow-image" />
        </div>
      </div>
    </div>
  );
};

export default ClientRegisterPage;
