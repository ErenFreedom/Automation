import axios from 'axios';

export const FETCH_GRAPH_DATA_REQUEST = 'FETCH_GRAPH_DATA_REQUEST';
export const FETCH_GRAPH_DATA_SUCCESS = 'FETCH_GRAPH_DATA_SUCCESS';
export const FETCH_GRAPH_DATA_FAILURE = 'FETCH_GRAPH_DATA_FAILURE';

export const fetchGraphData = (sensorApi, timeWindow) => async (dispatch) => {
    dispatch({ type: FETCH_GRAPH_DATA_REQUEST });
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/graph/fetch-data-all-apis-${timeWindow}?api=${sensorApi}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        dispatch({ type: FETCH_GRAPH_DATA_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({
            type: FETCH_GRAPH_DATA_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};
