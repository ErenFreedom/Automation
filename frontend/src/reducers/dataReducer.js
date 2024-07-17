import {
  FETCH_DATA_REQUEST,
  FETCH_DATA_SUCCESS,
  FETCH_DATA_FAILURE,
  UPDATE_DATA, // Import new action type
} from '../actions/dataActions';

const initialState = {
  loading: false,
  data: [],
  error: null,
};

const dataReducer = (state = initialState, action) => {
  switch (action.type) {
      case FETCH_DATA_REQUEST:
          return { ...state, loading: true };
      case FETCH_DATA_SUCCESS:
          return { ...state, loading: false, data: action.payload };
      case FETCH_DATA_FAILURE:
          return { ...state, loading: false, error: action.payload };
      case UPDATE_DATA: // Handle new action type
          return { ...state, data: action.payload };
      default:
          return state;
  }
};

export default dataReducer;
