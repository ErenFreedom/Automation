import {
    FETCH_CLIENT_DATA_REQUEST,
    FETCH_CLIENT_DATA_SUCCESS,
    FETCH_CLIENT_DATA_FAILURE,
    UPDATE_CLIENT_DATA, // Import new action type
  } from '../actions/clientDataActions';
  
  const initialState = {
    loading: false,
    data: [],
    error: null,
  };
  
  const clientDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_CLIENT_DATA_REQUEST:
            return { ...state, loading: true };
        case FETCH_CLIENT_DATA_SUCCESS:
            return { ...state, loading: false, data: action.payload };
        case FETCH_CLIENT_DATA_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case UPDATE_CLIENT_DATA: // Handle new action type
            return { ...state, data: action.payload };
        default:
            return state;
    }
  };
  
  export default clientDataReducer;
  