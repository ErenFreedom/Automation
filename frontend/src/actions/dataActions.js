import axios from 'axios';

export const FETCH_DATA_REQUEST = 'FETCH_DATA_REQUEST';
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS';
export const FETCH_DATA_FAILURE = 'FETCH_DATA_FAILURE';

export const fetchData = ({ url, token }) => async (dispatch) => {
    dispatch({ type: FETCH_DATA_REQUEST });
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}${url}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        dispatch({ type: FETCH_DATA_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({
            type: FETCH_DATA_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};
