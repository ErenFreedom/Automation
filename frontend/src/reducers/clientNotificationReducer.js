import {
    FETCH_CLIENT_ALERTS_REQUEST,
    FETCH_CLIENT_ALERTS_SUCCESS,
    FETCH_CLIENT_ALERTS_FAILURE,
  } from '../actions/clientNotificationActions';
  
  const initialState = {
    loading: false,
    alerts: [],
    error: null,
  };
  
  const clientNotificationReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_CLIENT_ALERTS_REQUEST:
        return { ...state, loading: true };
      case FETCH_CLIENT_ALERTS_SUCCESS:
        return { ...state, loading: false, alerts: action.payload };
      case FETCH_CLIENT_ALERTS_FAILURE:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export default clientNotificationReducer;
  