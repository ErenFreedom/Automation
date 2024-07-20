import { combineReducers } from 'redux';
import dataReducer from './dataReducer';
import graphReducer from './graphReducer';
import reportReducer from './reportReducer';
import notificationReducer from './notificationReducer';
import sensorReducer from './sensorReducer';
import clientDataReducer from './clientDataReducer';

export default combineReducers({
    data: dataReducer,
    graph: graphReducer,
    report: reportReducer,
    notifications: notificationReducer,
    sensors: sensorReducer,
    clientData: clientDataReducer, // Add the client data reducer here
});
