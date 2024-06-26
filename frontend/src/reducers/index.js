import { combineReducers } from '@reduxjs/toolkit';
import dataReducer from './dataReducer';
import notificationReducer from './notificationSlice';

const rootReducer = combineReducers({
  data: dataReducer,
  notifications: notificationReducer,
});

export default rootReducer;
