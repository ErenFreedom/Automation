// src/reducers/sensorReducer.js
import {
    FETCH_SENSOR_APIS_REQUEST,
    FETCH_SENSOR_APIS_SUCCESS,
    FETCH_SENSOR_APIS_FAILURE,
    SET_THRESHOLDS_REQUEST,
    SET_THRESHOLDS_SUCCESS,
    SET_THRESHOLDS_FAILURE,
  } from '../actions/sensorActions';
  
  const initialState = {
    loading: false,
    sensorApis: [],
    error: null,
  };
  
  const sensorReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_SENSOR_APIS_REQUEST:
      case SET_THRESHOLDS_REQUEST:
        return { ...state, loading: true };
      case FETCH_SENSOR_APIS_SUCCESS:
        return { ...state, loading: false, sensorApis: action.payload };
      case SET_THRESHOLDS_SUCCESS:
        return { ...state, loading: false };
      case FETCH_SENSOR_APIS_FAILURE:
      case SET_THRESHOLDS_FAILURE:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export default sensorReducer;
  