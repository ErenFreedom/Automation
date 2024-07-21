import axios from 'axios';

export const FETCH_CLIENT_SENSOR_APIS_REQUEST = 'FETCH_CLIENT_SENSOR_APIS_REQUEST';
export const FETCH_CLIENT_SENSOR_APIS_SUCCESS = 'FETCH_CLIENT_SENSOR_APIS_SUCCESS';
export const FETCH_CLIENT_SENSOR_APIS_FAILURE = 'FETCH_CLIENT_SENSOR_APIS_FAILURE';
export const SET_CLIENT_THRESHOLDS_REQUEST = 'SET_CLIENT_THRESHOLDS_REQUEST';
export const SET_CLIENT_THRESHOLDS_SUCCESS = 'SET_CLIENT_THRESHOLDS_SUCCESS';
export const SET_CLIENT_THRESHOLDS_FAILURE = 'SET_CLIENT_THRESHOLDS_FAILURE';
export const FETCH_CLIENT_CURRENT_THRESHOLDS_REQUEST = 'FETCH_CLIENT_CURRENT_THRESHOLDS_REQUEST';
export const FETCH_CLIENT_CURRENT_THRESHOLDS_SUCCESS = 'FETCH_CLIENT_CURRENT_THRESHOLDS_SUCCESS';
export const FETCH_CLIENT_CURRENT_THRESHOLDS_FAILURE = 'FETCH_CLIENT_CURRENT_THRESHOLDS_FAILURE';

export const fetchClientSensorApis = () => async (dispatch) => {
  dispatch({ type: FETCH_CLIENT_SENSOR_APIS_REQUEST });

  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/client-sensor-apis`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: FETCH_CLIENT_SENSOR_APIS_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error fetching client sensor APIs:', error);
    dispatch({ type: FETCH_CLIENT_SENSOR_APIS_FAILURE, payload: error.message });
  }
};

export const fetchClientCurrentThresholds = () => async (dispatch) => {
  dispatch({ type: FETCH_CLIENT_CURRENT_THRESHOLDS_REQUEST });

  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/client-current-thresholds`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: FETCH_CLIENT_CURRENT_THRESHOLDS_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error fetching client current thresholds:', error);
    dispatch({ type: FETCH_CLIENT_CURRENT_THRESHOLDS_FAILURE, payload: error.message });
  }
};

export const setClientThresholds = (thresholds) => async (dispatch) => {
  dispatch({ type: SET_CLIENT_THRESHOLDS_REQUEST });

  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/client-set-thresholds`, { thresholds }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    dispatch({ type: SET_CLIENT_THRESHOLDS_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error setting client thresholds:', error);
    dispatch({ type: SET_CLIENT_THRESHOLDS_FAILURE, payload: error.message });
  }
};
