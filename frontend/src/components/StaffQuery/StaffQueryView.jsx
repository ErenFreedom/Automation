import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffQueryView.css';

const QueryDetailsModal = ({ queryDetails, onClose }) => {
  if (!queryDetails) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{queryDetails.subject}</h2>
        <p><strong>Email:</strong> {queryDetails.clientEmail}</p>
        <p><strong>Department:</strong> {queryDetails.department}</p>
        <p><strong>Message:</strong> {queryDetails.message}</p>
        {queryDetails.imageUrl && (
          <div>
            <strong>Attached Image:</strong>
            <img src={`${process.env.REACT_APP_API_URL}/${queryDetails.imageUrl}`} alt="Attached" />
          </div>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const StaffQueryView = () => {
  const [queries, setQueries] = useState([]);
  const [department, setDepartment] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [staffId, setStaffId] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/staff-info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDepartment(response.data.department);
        setStaffId(response.data.id);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

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

  const handleView = async (queryId, uniqueId) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/query-details/${queryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Mark query as viewed
      await axios.post(`${process.env.REACT_APP_API_URL}/view-query`, { queryId, staffId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQueries(queries.map(q => q.id === queryId ? { ...q, status: 'Pending' } : q));
      setSelectedQuery(response.data);

      // Open Gmail with search query for the unique identifier
      window.open(`https://mail.google.com/mail/u/0/#search/${uniqueId}`, '_blank');
    } catch (error) {
      console.error('Error fetching query details:', error);
    }
  };

  const handleClose = async (queryId) => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/close-query`, { queryId, staffId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQueries(queries.map(q => q.id === queryId ? { ...q, status: 'Finished' } : q));
    } catch (error) {
      console.error('Error closing query:', error);
    }
  };

  const closeModal = () => {
    setSelectedQuery(null);
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
            <button onClick={() => handleView(query.id, query.uniqueId)}>View</button>
          )}
          {query.status === 'Pending' && (
            <button onClick={() => handleClose(query.id)}>Close Call</button>
          )}
        </div>
      ))}
      <QueryDetailsModal queryDetails={selectedQuery} onClose={closeModal} />
    </div>
  );
};

export default StaffQueryView;
