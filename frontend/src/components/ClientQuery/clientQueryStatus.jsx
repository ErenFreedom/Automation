import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './clientQueryStatus.css';
import logo from '../../assets/logo.png';

const ClientQueryStatus = () => {
  const [queries, setQueries] = useState([]);
  const [clientEmail, setClientEmail] = useState(localStorage.getItem('clientEmail') || '');

  useEffect(() => {
    if (clientEmail) {
      fetchQueries();
    }
  }, [clientEmail]);

  const fetchQueries = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/client-queries/${clientEmail}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setQueries(response.data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  return (
    <div className="query-status-container">
      <div className="header-container">
        <img src={logo} className="logo" alt="Platform Logo" />
        <h1>Your Queries</h1>
      </div>
      <div className="query-list">
        {queries.length > 0 ? (
          queries.map((query, index) => (
            <div key={index} className={`query-card status-${query.status.toLowerCase()}`}>
              <h2>{query.subject}</h2>
              <p><strong>Department:</strong> {query.department}</p>
              <p><strong>Message:</strong> {query.message}</p>
              {query.imageUrl && (
                <p>
                  <strong>Image:</strong> <a href={`${process.env.REACT_APP_API_URL}/${query.imageUrl}`} target="_blank" rel="noopener noreferrer">View Image</a>
                </p>
              )}
              <p><strong>Status:</strong> {query.status}</p>
              <p><strong>Raised At:</strong> {new Date(query.created_at).toLocaleString()}</p>
              {query.status === 'Finished' && (
                <div>
                  <p><strong>Closed By:</strong> {query.closed_by}</p>
                  <p><strong>Closed At:</strong> {new Date(query.closed_at).toLocaleString()}</p>
                  <p><strong>Time to Close:</strong> {query.time_to_close} minutes</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No queries found.</p>
        )}
      </div>
    </div>
  );
};

export default ClientQueryStatus;
