import { createSlice } from '@reduxjs/toolkit';
import { fetchData } from '../actions/dataActions';

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    data: null,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.data = null;
        state.error = action.error.message;
      });
  },
});

export default dataSlice.reducer;
