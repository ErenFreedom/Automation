// src/reducers/sensorReducer.js
import {
  FETCH_SENSOR_APIS_REQUEST,
  FETCH_SENSOR_APIS_SUCCESS,
  FETCH_SENSOR_APIS_FAILURE,
  SET_THRESHOLDS_REQUEST,
  SET_THRESHOLDS_SUCCESS,
  SET_THRESHOLDS_FAILURE,
  FETCH_CURRENT_THRESHOLDS_REQUEST,
  FETCH_CURRENT_THRESHOLDS_SUCCESS,
  FETCH_CURRENT_THRESHOLDS_FAILURE,
} from '../actions/sensorActions';

const initialState = {
  loading: false,
  sensorApis: [],
  currentThresholds: {},
  error: null,
};

const sensorReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SENSOR_APIS_REQUEST:
    case SET_THRESHOLDS_REQUEST:
    case FETCH_CURRENT_THRESHOLDS_REQUEST:
      return { ...state, loading: true };
    case FETCH_SENSOR_APIS_SUCCESS:
      return { ...state, loading: false, sensorApis: action.payload };
    case SET_THRESHOLDS_SUCCESS:
    case FETCH_CURRENT_THRESHOLDS_SUCCESS:
      return { ...state, loading: false, currentThresholds: action.payload };
    case FETCH_SENSOR_APIS_FAILURE:
    case SET_THRESHOLDS_FAILURE:
    case FETCH_CURRENT_THRESHOLDS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default sensorReducer;
