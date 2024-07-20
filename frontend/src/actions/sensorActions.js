// src/actions/sensorActions.js
import axios from 'axios';

export const FETCH_SENSOR_APIS_REQUEST = 'FETCH_SENSOR_APIS_REQUEST';
export const FETCH_SENSOR_APIS_SUCCESS = 'FETCH_SENSOR_APIS_SUCCESS';
export const FETCH_SENSOR_APIS_FAILURE = 'FETCH_SENSOR_APIS_FAILURE';
export const SET_THRESHOLDS_REQUEST = 'SET_THRESHOLDS_REQUEST';
export const SET_THRESHOLDS_SUCCESS = 'SET_THRESHOLDS_SUCCESS';
export const SET_THRESHOLDS_FAILURE = 'SET_THRESHOLDS_FAILURE';
export const FETCH_CURRENT_THRESHOLDS_REQUEST = 'FETCH_CURRENT_THRESHOLDS_REQUEST';
export const FETCH_CURRENT_THRESHOLDS_SUCCESS = 'FETCH_CURRENT_THRESHOLDS_SUCCESS';
export const FETCH_CURRENT_THRESHOLDS_FAILURE = 'FETCH_CURRENT_THRESHOLDS_FAILURE';

export const fetchSensorApis = () => async (dispatch) => {
  dispatch({ type: FETCH_SENSOR_APIS_REQUEST });

  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/sensor-apis`, {
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
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/current-thresholds`, {
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
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/set-thresholds`, { thresholds }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    dispatch({ type: SET_THRESHOLDS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: SET_THRESHOLDS_FAILURE, payload: error.message });
  }
};
