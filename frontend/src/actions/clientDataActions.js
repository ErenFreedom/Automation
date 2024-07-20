import axios from 'axios';

export const FETCH_CLIENT_DATA_REQUEST = 'FETCH_CLIENT_DATA_REQUEST';
export const FETCH_CLIENT_DATA_SUCCESS = 'FETCH_CLIENT_DATA_SUCCESS';
export const FETCH_CLIENT_DATA_FAILURE = 'FETCH_CLIENT_DATA_FAILURE';
export const UPDATE_CLIENT_DATA = 'UPDATE_CLIENT_DATA'; // New action type

export const fetchClientData = ({ url, token }) => async (dispatch) => {
    dispatch({ type: FETCH_CLIENT_DATA_REQUEST });
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}${url}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        dispatch({ type: FETCH_CLIENT_DATA_SUCCESS, payload: response.data });
    } catch (error) {
        dispatch({
            type: FETCH_CLIENT_DATA_FAILURE,
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};

// New action to update data
export const updateClientData = (newData) => ({
    type: UPDATE_CLIENT_DATA,
    payload: newData,
});
