import axios from 'axios';
import jwtDecode from 'jwt-decode';

export const FETCH_SENSOR_APIS_REQUEST = 'FETCH_SENSOR_APIS_REQUEST';
export const FETCH_SENSOR_APIS_SUCCESS = 'FETCH_SENSOR_APIS_SUCCESS';
export const FETCH_SENSOR_APIS_FAILURE = 'FETCH_SENSOR_APIS_FAILURE';
export const SET_THRESHOLDS_REQUEST = 'SET_THRESHOLDS_REQUEST';
export const SET_THRESHOLDS_SUCCESS = 'SET_THRESHOLDS_SUCCESS';
export const SET_THRESHOLDS_FAILURE = 'SET_THRESHOLDS_FAILURE';
export const FETCH_CURRENT_THRESHOLDS_REQUEST = 'FETCH_CURRENT_THRESHOLDS_REQUEST';
export const FETCH_CURRENT_THRESHOLDS_SUCCESS = 'FETCH_CURRENT_THRESHOLDS_SUCCESS';
export const FETCH_CURRENT_THRESHOLDS_FAILURE = 'FETCH_CURRENT_THRESHOLDS_FAILURE';

const getApiUrl = (endpoint) => {
  const token = localStorage.getItem('authToken');
  const decodedToken = jwtDecode(token);
  const isStaff = decodedToken.department ? true : false;

  return isStaff ? `${process.env.REACT_APP_API_URL}/${endpoint}` : `${process.env.REACT_APP_API_URL}/client-${endpoint}`;
};

export const fetchSensorApis = () => async (dispatch) => {
  dispatch({ type: FETCH_SENSOR_APIS_REQUEST });

  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(getApiUrl('sensor-apis'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: FETCH_SENSOR_APIS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_SENSOR_APIS_FAILURE, payload: error.message });
  }
};

export const fetchCurrentThresholds = () => async (dispatch) => {
  dispatch({ type: FETCH_CURRENT_THRESHOLDS_REQUEST });

  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(getApiUrl('current-thresholds'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: FETCH_CURRENT_THRESHOLDS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_CURRENT_THRESHOLDS_FAILURE, payload: error.message });
  }
};

export const setThresholds = (thresholds) => async (dispatch) => {
  dispatch({ type: SET_THRESHOLDS_REQUEST });

  const token = localStorage.getItem('authToken');
  try {
    const payload = { thresholds };
    console.log('Sending payload:', JSON.stringify(payload)); // Log the payload
    const response = await axios.post(getApiUrl('set-thresholds'), payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    dispatch({ type: SET_THRESHOLDS_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error setting thresholds:', error.response ? error.response.data : error.message); // Log the error response
    dispatch({ type: SET_THRESHOLDS_FAILURE, payload: error.message });
  }
};
