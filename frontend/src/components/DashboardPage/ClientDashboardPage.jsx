import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientData, updateClientData } from '../../actions/clientDataActions';
import ClientDashboardHeader from '../DashboardHeader/ClientDashboardHeader';
import { FaEye } from 'react-icons/fa';
import 'event-source-polyfill';
import './DashboardPage.css';

const ClientDashboardPage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.clientData.data);
  const loading = useSelector((state) => state.clientData.loading);
  const error = useSelector((state) => state.clientData.error);
  const [monitoring, setMonitoring] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch(fetchClientData({ url: '/client-sensor-data/fetch-last-sensor-data-each-api', token }));

      const eventSource = new EventSource(`${process.env.REACT_APP_API_URL}/client-sensor-data/stream?token=${token}`);

      eventSource.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        dispatch(updateClientData(newData));
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [dispatch]);

  return (
    <div className="dashboard-page-container">
      <ClientDashboardHeader />
      <div className="welcome-container">
        <h2 className="welcome-message">Welcome to your dashboard, User {userId}</h2>
      </div>
      <div className="dashboard-page">
        <div className="dashboard-content">
          <div className="rectangles">
            {loading && (
              <div className="loading-container">
                <FaEye className="loading-eye" />
                <p>Loading data...</p>
              </div>
            )}
            {error && <p className="error">{error}</p>}
            {data && data.map((apiData) => (
              <Link key={apiData.sensor_api} to={`/graph/${userId}/${encodeURIComponent(apiData.sensor_api)}`} className="rectangle-link">
                <div className="rectangle">
                  <p>{apiData.sensor_api.replace(/^.*[\\/]/, '')} Value: {apiData.value}</p>
                  <p>Updated At: {apiData.timestamp}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      {monitoring && <FaEye className="monitoring-icon" />}
    </div>
  );
};

export default ClientDashboardPage;
