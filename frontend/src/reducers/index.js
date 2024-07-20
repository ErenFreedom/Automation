import { combineReducers } from 'redux';
import dataReducer from './dataReducer';
import graphReducer from './graphReducer';
import reportReducer from './reportReducer';
import notificationReducer from './notificationReducer';
import sensorReducer from './sensorReducer';


export default combineReducers({
    data: dataReducer,
    graph: graphReducer,
    report: reportReducer,
    notifications: notificationReducer,
    sensors: sensorReducer,
});
