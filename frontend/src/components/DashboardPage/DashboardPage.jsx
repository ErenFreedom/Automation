import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import './DashboardPage.css';

const fetchData = async ({ queryKey }) => {
  const { data } = await axios.get(queryKey[0], {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  return data;
};

const DashboardPage = () => {
  const { userId } = useParams();
  const queryClient = useQueryClient();
  const [data, setData] = useState([]);
  const { data: initialData, error, isLoading } = useQuery(
    ['/sensor-data/fetch-last-sensor-data-each-api'],
    fetchData,
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const eventSource = new EventSource(`${process.env.REACT_APP_API_URL}/sensor-data/stream`);

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
      queryClient.setQueryData(['/sensor-data/fetch-last-sensor-data-each-api'], newData);
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  if (isLoading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p className="error">{error.message}</p>;
  }

  return (
    <div className="dashboard-page-container">
      <DashboardHeader />
      <div className="welcome-container">
        <h2 className="welcome-message">Welcome to your dashboard, User {userId}</h2>
      </div>
      <div className="dashboard-page">
        <div className="dashboard-content">
          <div className="rectangles">
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
