import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffQueryView.css';

const StaffQueryView = () => {
  const [queries, setQueries] = useState([]);
  const [department, setDepartment] = useState('');
  const userId = '1'; // Hardcoded userId for testing

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/staff-info`, {
          params: { userId }, // Pass userId as a query parameter
        });
        setDepartment(response.data.department); // Assuming the response contains the staff's department
      } catch (error) {
        console.error('Error fetching staff data:', error);
        alert('Failed to fetch staff data');
      }
    };

    fetchStaffData();
  }, []);

  useEffect(() => {
    const fetchQueries = async () => {
      if (!department) return; // Ensure department is set before making the request
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/queries/${department}`);
        setQueries(response.data);
      } catch (error) {
        console.error('Error fetching queries:', error);
        alert('Failed to fetch queries');
      }
    };

    fetchQueries();
  }, [department]);

  const handleView = async (queryId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/view-query`, { queryId });
      setQueries(queries.map(q => q.id === queryId ? { ...q, status: 'Pending' } : q));
    } catch (error) {
      console.error('Error updating query status:', error);
      alert('Failed to update query status');
    }
  };

  const handleClose = async (queryId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/close-query`, { queryId });
      setQueries(queries.map(q => q.id === queryId ? { ...q, status: 'Finished' } : q));
    } catch (error) {
      console.error('Error closing query:', error);
      alert('Failed to close query');
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
