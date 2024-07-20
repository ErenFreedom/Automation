import {
  FETCH_CLIENT_SENSOR_APIS_REQUEST,
  FETCH_CLIENT_SENSOR_APIS_SUCCESS,
  FETCH_CLIENT_SENSOR_APIS_FAILURE,
  SET_CLIENT_THRESHOLDS_REQUEST,
  SET_CLIENT_THRESHOLDS_SUCCESS,
  SET_CLIENT_THRESHOLDS_FAILURE,
  FETCH_CLIENT_CURRENT_THRESHOLDS_REQUEST,
  FETCH_CLIENT_CURRENT_THRESHOLDS_SUCCESS,
  FETCH_CLIENT_CURRENT_THRESHOLDS_FAILURE,
} from '../actions/clientSensorActions';

const initialState = {
  loading: false,
  sensorApis: [],
  currentThresholds: {},
  error: null,
};

const clientSensorReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CLIENT_SENSOR_APIS_REQUEST:
    case SET_CLIENT_THRESHOLDS_REQUEST:
    case FETCH_CLIENT_CURRENT_THRESHOLDS_REQUEST:
      return { ...state, loading: true };
    case FETCH_CLIENT_SENSOR_APIS_SUCCESS:
      return { ...state, loading: false, sensorApis: action.payload };
    case SET_CLIENT_THRESHOLDS_SUCCESS:
    case FETCH_CLIENT_CURRENT_THRESHOLDS_SUCCESS:
      return { ...state, loading: false, currentThresholds: action.payload };
    case FETCH_CLIENT_SENSOR_APIS_FAILURE:
    case SET_CLIENT_THRESHOLDS_FAILURE:
    case FETCH_CLIENT_CURRENT_THRESHOLDS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default clientSensorReducer;
