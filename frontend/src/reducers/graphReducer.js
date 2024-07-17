import {
    FETCH_GRAPH_DATA_REQUEST,
    FETCH_GRAPH_DATA_SUCCESS,
    FETCH_GRAPH_DATA_FAILURE,
} from '../actions/graphActions';

const initialState = {
    loading: false,
    data: null,
    error: null,
};

const graphReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_GRAPH_DATA_REQUEST:
            return { ...state, loading: true };
        case FETCH_GRAPH_DATA_SUCCESS:
            return { ...state, loading: false, data: action.payload };
        case FETCH_GRAPH_DATA_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default graphReducer;
