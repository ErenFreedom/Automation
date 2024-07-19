import { combineReducers } from 'redux';
import dataReducer from './dataReducer';
import graphReducer from './graphReducer';
import reportReducer from './reportReducer';

export default combineReducers({
    data: dataReducer,
    graph: graphReducer,
    report: reportReducer,
});
