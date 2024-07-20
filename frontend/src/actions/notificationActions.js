// src/actions/notificationActions.js
import axios from 'axios';

export const FETCH_ALERTS_REQUEST = 'FETCH_ALERTS_REQUEST';
export const FETCH_ALERTS_SUCCESS = 'FETCH_ALERTS_SUCCESS';
export const FETCH_ALERTS_FAILURE = 'FETCH_ALERTS_FAILURE';

export const fetchAlerts = () => async (dispatch) => {
  dispatch({ type: FETCH_ALERTS_REQUEST });

  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({ type: FETCH_ALERTS_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({ type: FETCH_ALERTS_FAILURE, payload: error.message });
  }
};
