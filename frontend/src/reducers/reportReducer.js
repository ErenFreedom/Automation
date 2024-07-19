import {
    FETCH_REPORT_REQUEST,
    FETCH_REPORT_SUCCESS,
    FETCH_REPORT_FAILURE,
  } from '../actions/reportActions';
  
  const initialState = {
    loading: false,
    data: null,
    error: null,
  };
  
  const reportReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_REPORT_REQUEST:
        return { ...state, loading: true };
      case FETCH_REPORT_SUCCESS:
        return { ...state, loading: false, data: action.payload };
      case FETCH_REPORT_FAILURE:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export default reportReducer;
  