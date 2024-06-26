import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchClientData = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/client-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClientEmail(response.data.email); // Assuming the response contains the client's email
      } catch (error) {
        console.error('Error fetching client data:', error);
        alert('Failed to fetch client data');
      }
    };

    fetchClientData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('clientEmail', clientEmail);
    formData.append('department', department);
    formData.append('subject', subject);
    formData.append('message', message);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/raise-query`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
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
          <label>Department:</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">Select Department</option>
            <option value="temperature">Temperature</option>
            <option value="pressure">Pressure</option>
            <option value="humidity">Humidity</option>
            <option value="rh">RH</option>
          </select>
        </div>
        <div>
          <label>Subject:</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <label>Message:</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
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
