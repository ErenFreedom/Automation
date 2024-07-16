// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchRhData } from '../../actions/dataActions';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer
// } from 'recharts';
// import './ConfigTabs.css'; // Import the common CSS file

// const Rh = () => {
//   const [filter, setFilter] = useState('1day'); // Default filter
//   const dispatch = useDispatch();
//   const rhData = useSelector((state) => state.data.rhData);
//   const error = useSelector((state) => state.data.error);
//   const token = localStorage.getItem('authToken');

//   useEffect(() => {
//     if (token) {
//       dispatch(fetchRhData({ filter, token }));
//     }
//   }, [dispatch, filter, token]);

//   const handleFilterChange = (event) => {
//     setFilter(event.target.value);
//   };

//   const formatXAxis = (tickItem) => {
//     const date = new Date(tickItem);
//     return date.toLocaleString();
//   };

//   return (
//     <div className="config-content">
//       <h3>RH Details</h3>
//       <select className="filter-select" value={filter} onChange={handleFilterChange}>
//         <option value="1day">Last 1 day</option>
//         <option value="1week">Last 1 week</option>
//         <option value="1month">Last 1 month</option>
//       </select>
//       {error && <p className="error">{error}</p>}
//       {rhData && rhData.data.length ? (
//         <>
//           <ResponsiveContainer width="100%" height={400} className="chart-container">
//             <LineChart
//               data={rhData.data}
//               margin={{
//                 top: 5, right: 30, left: 20, bottom: 5,
//               }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
//               <YAxis />
//               <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
//               <Legend />
//               <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
//             </LineChart>
//           </ResponsiveContainer>
//           <div className="metrics">
//             <p><strong>Average:</strong> {rhData.metrics.average}</p>
//             <p><strong>Max:</strong> {rhData.metrics.max}</p>
//             <p><strong>Min:</strong> {rhData.metrics.min}</p>
//             <p><strong>Range:</strong> {rhData.metrics.range}</p>
//             <p><strong>Variance:</strong> {rhData.metrics.variance}</p>
//             <p><strong>Standard Deviation:</strong> {rhData.metrics.stddev}</p>
//           </div>
//         </>
//       ) : (
//         <p>Loading data...</p>
//       )}
//     </div>
//   );
// };

// export default Rh;
