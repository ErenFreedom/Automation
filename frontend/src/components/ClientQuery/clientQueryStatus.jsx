import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './clientQueryStatus.css'; // Create this file for styling

const ClientQueryStatus = () => {
  const { userId } = useParams();
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    const fetchQueries = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/query/status`, {
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
  }, [userId]);

  return (
    <div className="client-query-status-container">
      <h2>Query Status</h2>
      <div className="queries-list">
        {queries.map((query) => (
          <div key={query.id} className="query-item">
            <h3>{query.subject}</h3>
            <p>{query.message}</p>
            <p>Status: {query.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientQueryStatus;
