import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffQueryView.css';

const StaffQueryView = () => {
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/queries`);
        setQueries(response.data);
      } catch (error) {
        console.error('Error fetching queries:', error);
      }
    };

    fetchQueries();
  }, []);

  const handleView = async (queryId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/queries/view`, { queryId });
      setQueries(queries.map(q => q.id === queryId ? { ...q, status: 'Pending' } : q));
    } catch (error) {
      console.error('Error updating query status:', error);
    }
  };

  const handleClose = async (queryId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/queries/close`, { queryId });
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
