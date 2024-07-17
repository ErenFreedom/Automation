import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchData, updateData } from '../../actions/dataActions'; // Import updateData action
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import 'eventsource-polyfill';
import './DashboardPage.css';

const DashboardPage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.data);
  const loading = useSelector((state) => state.data.loading);
  const error = useSelector((state) => state.data.error);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch(fetchData({ url: '/sensor-data/fetch-last-sensor-data-each-api', token }));

      const eventSource = new EventSource(`${process.env.REACT_APP_API_URL}/sensor-data/stream?token=${token}`);

      eventSource.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        dispatch(updateData(newData));
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
      <DashboardHeader />
      <div className="welcome-container">
        <h2 className="welcome-message">Welcome to your dashboard, User {userId}</h2>
      </div>
      <div className="dashboard-page">
        <div className="dashboard-content">
          <div className="rectangles">
            {loading && <p>Loading data...</p>}
            {error && <p className="error">{error}</p>}
            {data && data.map((apiData) => (
              <Link key={apiData.sensor_api} to={`/${apiData.sensor_api}/${userId}`} className="rectangle-link">
                <div className="rectangle">
                  <p>{apiData.sensor_api.replace(/^.*[\\/]/, '')} Value: {apiData.value}</p>
                  <p>Updated At: {apiData.timestamp}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
