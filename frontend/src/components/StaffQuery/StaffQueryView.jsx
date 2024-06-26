import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffQueryView.css';

const StaffQueryView = () => {
  const [queries, setQueries] = useState([]);
  const [department, setDepartment] = useState('temperature'); // Set a default department or fetch it dynamically

  useEffect(() => {
    const fetchQueries = async () => {
      const token = localStorage.getItem('authToken');
      if (!department) return; // Ensure department is set before making the request
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/queries/${department}`, {
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
  }, [department]);

  const handleView = async (queryId) => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/view-query`, { queryId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQueries(queries.map(q => q.id === queryId ? { ...q, status: 'Pending' } : q));
    } catch (error) {
      console.error('Error updating query status:', error);
    }
  };

  const handleClose = async (queryId) => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/close-query`, { queryId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQueries(queries.map(q => q.id === queryId ? { ...q, status: 'Finished' } : q));
    } catch (error) {
      console.error('Error closing query:', error);
    }
  };

  return (
    <div className="staff-query-view-container">
      <h2>Queries</h2>
      {queries.map(query => (
        <div key={query.id} className="query-item">
          <h3>{query.subject}</h3>
          <p>{query.message}</p>
          <p>Status: {query.status}</p>
          {query.status === 'Received' && (
            <button onClick={() => handleView(query.id)}>View</button>
          )}
          {query.status === 'Pending' && (
            <button onClick={() => handleClose(query.id)}>Close Call</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default StaffQueryView;
