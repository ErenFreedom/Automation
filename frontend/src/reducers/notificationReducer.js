// src/reducers/notificationReducer.js
import {
  FETCH_ALERTS_REQUEST,
  FETCH_ALERTS_SUCCESS,
  FETCH_ALERTS_FAILURE,
} from '../actions/notificationActions';

const initialState = {
  loading: false,
  alerts: [],
  error: null,
};

const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ALERTS_REQUEST:
      return { ...state, loading: true };
    case FETCH_ALERTS_SUCCESS:
      return { ...state, loading: false, alerts: action.payload };
    case FETCH_ALERTS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default notificationReducer;
