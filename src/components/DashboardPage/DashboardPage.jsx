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
  const error = useSelector((state) => state.data.error);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch(fetchData({ url: `${process.env.REACT_APP_API_URL}/latest`, token }));
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
            {error && <p className="error">{error}</p>}
            {data ? (
              <>
                <Link to={`/temperature/${userId}`} className="rectangle-link">
                  <div className="rectangle">
                    <p>Current Temperature: {data.temp?.value}</p>
                    <p>Updated At: {data.temp?.timestamp}</p>
                  </div>
                </Link>
                <Link to={`/pressure/${userId}`} className="rectangle-link">
                  <div className="rectangle">
                    <p>Current Pressure: {data.pressure?.value}</p>
                    <p>Updated At: {data.pressure?.timestamp}</p>
                  </div>
                </Link>
                <Link to={`/rh/${userId}`} className="rectangle-link">
                  <div className="rectangle">
                    <p>Current Rh: {data.rh?.value}</p>
                    <p>Updated At: {data.rh?.timestamp}</p>
                  </div>
                </Link>
                <Link to={`/humidity/${userId}`} className="rectangle-link">
                  <div className="rectangle">
                    <p>Current Humidity: {data.humidity?.value}</p>
                    <p>Updated At: {data.humidity?.timestamp}</p>
                  </div>
                </Link>
              </>
            ) : (
              <p>Loading data...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
