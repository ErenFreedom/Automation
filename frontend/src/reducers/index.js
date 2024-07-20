import { combineReducers } from 'redux';
import dataReducer from './dataReducer';
import graphReducer from './graphReducer';
import reportReducer from './reportReducer';
import notificationReducer from './notificationReducer';
import sensorReducer from './sensorReducer';
import clientDataReducer from './clientDataReducer';
import clientNotificationReducer from './clientNotificationReducer'; // New client notification reducer
import clientSensorReducer from './clientSensorReducer'; // New client sensor reducer

export default combineReducers({
    data: dataReducer,
    graph: graphReducer,
    report: reportReducer,
    notifications: notificationReducer,
    sensors: sensorReducer,
    clientData: clientDataReducer,
    clientNotifications: clientNotificationReducer, // Add client notification reducer here
    clientSensors: clientSensorReducer, // Add client sensor reducer here
});
