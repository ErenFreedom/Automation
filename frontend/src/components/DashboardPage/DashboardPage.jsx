import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from '../../actions/dataActions';
import DashboardHeader from '../DashboardHeader/DashboardHeader';
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
      dispatch(fetchData({ url: `${process.env.REACT_APP_API_URL}/fetch-last-sensor-data-each-api`, token }));
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
              <Link key={apiData.api} to={`/${apiData.api}/${userId}`} className="rectangle-link">
                <div className="rectangle">
                  <p>{apiData.api.replace(/^.*[\\/]/, '')} Value: {apiData.data[0]?.value}</p>
                  <p>Updated At: {apiData.data[0]?.timestamp}</p>
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
