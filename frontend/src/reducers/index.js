import { combineReducers } from 'redux';
import dataReducer from './dataReducer';
import graphReducer from './graphReducer';

export default combineReducers({
    data: dataReducer,
    graph: graphReducer,
});
