import axios from 'axios';

export const FETCH_REPORT_REQUEST = 'FETCH_REPORT_REQUEST';
export const FETCH_REPORT_SUCCESS = 'FETCH_REPORT_SUCCESS';
export const FETCH_REPORT_FAILURE = 'FETCH_REPORT_FAILURE';

export const fetchReport = (reportParams) => async (dispatch) => {
  dispatch({ type: FETCH_REPORT_REQUEST });
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/generate-report`,
      reportParams,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );
    dispatch({ type: FETCH_REPORT_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({
      type: FETCH_REPORT_FAILURE,
      payload: error.response ? error.response.data.message : error.message,
    });
  }
};
