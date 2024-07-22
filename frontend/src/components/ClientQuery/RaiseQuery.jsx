import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './RaiseQuery.css';
import logo from '../../assets/logo.png';

const RaiseQuery = () => {
  const [formData, setFormData] = useState({
    clientEmail: '',
    department: '',
    subject: '',
    message: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const token = localStorage.getItem('authToken');
    const formDataObj = new FormData();
    formDataObj.append('clientEmail', formData.clientEmail);
    formDataObj.append('department', formData.department);
    formDataObj.append('subject', formData.subject);
    formDataObj.append('message', formData.message);
    if (formData.image) {
      formDataObj.append('image', formData.image);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/raise-query`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      setMessage('Query raised successfully');
      toast.success('Query raised successfully');
    } catch (error) {
      setError(error.response?.data || 'An error occurred');
      toast.error('Failed to raise query');
    }
  };

  return (
    <div className="raise-query-container">
      <ToastContainer />
      <div className="header-container">
        <img src={logo} className="logo" alt="Platform Logo" />
        <h1>Raise a Query</h1>
      </div>
      <form className="raise-query-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="clientEmail" value={formData.clientEmail} onChange={handleChange} placeholder="Enter your email" required />
        </label>
        <label>
          Department
          <select name="department" value={formData.department} onChange={handleChange} required>
            <option value="">Select your department</option>
            <option value="temperature">Temperature</option>
            <option value="pressure">Pressure</option>
            <option value="humidity">Humidity</option>
            <option value="rh">RH</option>
          </select>
        </label>
        <label>
          Subject
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Enter the subject" required />
        </label>
        <label>
          Message
          <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Enter your message" required />
        </label>
        <label>
          Image (optional)
          <input type="file" name="image" accept="image/*" onChange={handleImageChange} />
        </label>
        <button type="submit">Raise Query</button>
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default RaiseQuery;
