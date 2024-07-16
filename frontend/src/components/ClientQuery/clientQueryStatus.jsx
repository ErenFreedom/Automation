import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './clientQueryStatus.css';

const ClientQueryStatus = () => {
  const [queries, setQueries] = useState([]);
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    const fetchClientDetails = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/client-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClientEmail(response.data.email);
      } catch (error) {
        console.error('Error fetching client details:', error);
      }
    };

    fetchClientDetails();
  }, []);

  useEffect(() => {
    const fetchQueries = async () => {
      const token = localStorage.getItem('authToken');
      if (!clientEmail) return; // Ensure clientEmail is set before making the request
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/client-query-status/${clientEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQueries(response.data);
      } catch (error) {
        console.error('Error fetching queries:', error);
      }
    };

    fetchQueries();
  }, [clientEmail]);

  return (
    <div className="client-query-status-container">
      <h2>Your Queries</h2>
      {queries.map(query => (
        <div key={query.id} className="query-item">
          <h3>{query.subject}</h3>
          <p>{query.message}</p>
          <p>Status: {query.status}</p>
        </div>
      ))}
    </div>
  );
};

export default ClientQueryStatus;
