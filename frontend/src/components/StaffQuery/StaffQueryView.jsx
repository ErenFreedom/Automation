import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StaffQueryView.css';

const StaffQueryView = () => {
  const [queries, setQueries] = useState([]);
  const [error, setError] = useState('');
  const department = 'temperature'; // This should be dynamically fetched based on staff details

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/staff-queries/${department}`);
        setQueries(response.data);
      } catch (error) {
        setError('Failed to fetch queries');
      }
    };

    fetchQueries();
    const interval = setInterval(fetchQueries, 5000); // Fetch queries every 5 seconds

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [department]);

  const handleReceive = async (queryId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/receive-query`, { queryId, staffId: 1 }); // Assuming staffId is 1 for now
      toast.success('Query status updated to Pending');
      setQueries(queries.map(query => query.id === queryId ? { ...query, status: 'Pending' } : query));
    } catch (error) {
      toast.error('Failed to update query status');
    }
  };

  const handleClose = async (queryId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/close-query`, { queryId, staffId: 1 }); // Assuming staffId is 1 for now
      toast.success('Query status updated to Closed');
      setQueries(queries.map(query => query.id === queryId ? { ...query, status: 'Closed' } : query));
    } catch (error) {
      toast.error('Failed to update query status');
    }
  };

  return (
    <div className="staff-query-view-container">
      <ToastContainer />
      <h1>Department Queries</h1>
      {error && <p className="error">{error}</p>}
      {queries.length === 0 ? (
        <p>No queries found.</p>
      ) : (
        <div className="queries-list">
          {queries.map(query => (
            <div key={query.id} className="query-card">
              <p><strong>Client Email:</strong> {query.clientEmail}</p>
              <p><strong>Department:</strong> {query.department}</p>
              <p><strong>Subject:</strong> {query.subject}</p>
              <p><strong>Message:</strong> {query.message}</p>
              {query.imageUrl && <img src={`${process.env.REACT_APP_API_URL}/${query.imageUrl}`} alt="Query Attachment" className="query-image" />}
              <p><strong>Status:</strong> {query.status}</p>
              {query.status === 'Received' && (
                <button className="status-button" onClick={() => handleReceive(query.id)}>Receive Query</button>
              )}
              {query.status === 'Pending' && (
                <button className="status-button" onClick={() => handleClose(query.id)}>Close Query</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffQueryView;
