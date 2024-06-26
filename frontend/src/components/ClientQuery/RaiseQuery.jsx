import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './RaiseQuery.css'; // Create this file for styling

const RaiseQuery = () => {
  const { userId } = useParams();
  const [clientEmail, setClientEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('clientEmail', clientEmail);
    formData.append('department', department);
    formData.append('subject', subject);
    formData.append('message', message);
    if (image) {
      formData.append('imageUrl', image);
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/raise-query`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Ensure this header is set
        },
      });
      alert('Query raised successfully');
    } catch (error) {
      console.error('Error raising query:', error);
      alert('Failed to raise query');
    }
  };

  return (
    <div className="raise-query-container">
      <h2>Raise a Query</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Client Email:</label>
          <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
        </div>
        <div>
          <label>Department:</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
            <option value="">Select Department</option>
            <option value="temperature">Temperature</option>
            <option value="pressure">Pressure</option>
            <option value="humidity">Humidity</option>
            <option value="rh">RH</option>
          </select>
        </div>
        <div>
          <label>Subject:</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label>Message:</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required></textarea>
        </div>
        <div>
          <label>Image:</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default RaiseQuery;
