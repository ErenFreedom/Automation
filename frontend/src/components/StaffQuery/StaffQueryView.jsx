import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StaffQueryView.css';
import logo from '../../assets/logo.png';

const StaffQueryView = () => {
  const [queries, setQueries] = useState([]);
  const [staffEmail, setStaffEmail] = useState(localStorage.getItem('staffEmail') || '');

  useEffect(() => {
    if (staffEmail) {
      fetchQueries();
    }
  }, [staffEmail]);

  const fetchQueries = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/staff-queries`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      setQueries(response.data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  const handleReceiveQuery = async (queryId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/receive-query`, { queryId }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      fetchQueries();
    } catch (error) {
      console.error('Error receiving query:', error);
    }
  };

  const handleCloseQuery = async (queryId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/close-query`, { queryId }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      fetchQueries();
    } catch (error) {
      console.error('Error closing query:', error);
    }
  };

  return (
    <div className="query-view-container">
      <div className="header-container">
        <img src={logo} className="logo" alt="Platform Logo" />
        <h1>All Queries</h1>
      </div>
      <div className="query-list">
        {queries.length > 0 ? (
          queries.map((query, index) => (
            <div key={index} className={`query-card status-${query.status.toLowerCase()}`}>
              <h2>{query.subject}</h2>
              <p><strong>Client Email:</strong> {query.clientEmail}</p>
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
              {query.status === 'Received' && (
                <button onClick={() => handleReceiveQuery(query.id)}>Receive</button>
              )}
              {query.status === 'Pending' && (
                <button onClick={() => handleCloseQuery(query.id)}>Close Call</button>
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

export default StaffQueryView;
