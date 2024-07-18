import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGraphData } from '../../actions/graphActions';
import './GraphPage.css';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter
Chart.register(...registerables);

const GraphPage = () => {
    const { sensorApi } = useParams();
    const dispatch = useDispatch();
    const graphData = useSelector((state) => state.graph.data);
    const loading = useSelector((state) => state.graph.loading);
    const error = useSelector((state) => state.graph.error);
    const [timeWindow, setTimeWindow] = useState('1day');

    useEffect(() => {
        dispatch(fetchGraphData(sensorApi, timeWindow));
    }, [dispatch, sensorApi, timeWindow]);

    const handleTimeWindowChange = (event) => {
        setTimeWindow(event.target.value);
    };

    useEffect(() => {
        if (graphData && graphData.length > 0) {
            const filteredData = graphData.find(data => data.api === sensorApi);
            console.log('Filtered Data:', filteredData); // Debug log

            const ctx = document.getElementById('graphCanvas').getContext('2d');

            // Destroy any existing chart instance
            if (window.myChart) {
                window.myChart.destroy();
            }

            if (filteredData && filteredData.data.length > 0) {
                const dataset = {
                    label: sensorApi,
                    data: filteredData.data.map(item => ({ x: new Date(item.timestamp), y: item.value })),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    fill: false,
                };

                console.log('Dataset:', dataset); // Debug log

                window.myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [dataset],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const date = new Date(context.parsed.x).toLocaleString();
                                        const value = context.parsed.y;
                                        return `Value: ${value}, Timestamp: ${date}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'hour'
                                },
                                title: {
                                    display: true,
                                    text: 'Time'
                                },
                                ticks: {
                                    autoSkip: true,
                                    maxTicksLimit: 10,
                                }
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Value'
                                }
                            }
                        }
                    }
                });
            }
        }
    }, [graphData, sensorApi]);

    return (
        <div className="graph-page-container">
            <div className="filter-container">
                <select value={timeWindow} onChange={handleTimeWindowChange}>
                    <option value="1day">1 Day</option>
                    <option value="1week">1 Week</option>
                    <option value="1month">1 Month</option>
                </select>
            </div>
            <div className="graph-container">
                {loading && <p>Loading data...</p>}
                {error && <p className="error">{error}</p>}
                {graphData && graphData.length > 0 && (
                    <canvas id="graphCanvas" className="graph-canvas" />
                )}
            </div>
            <div className="metrics-container">
                {graphData && graphData.length > 0 && (
                    <div>
                        <h3>Metrics for {sensorApi}</h3>
                        <p>Average: {graphData[0].metrics.average}</p>
                        <p>Max: {graphData[0].metrics.max}</p>
                        <p>Min: {graphData[0].metrics.min}</p>
                        <p>Range: {graphData[0].metrics.range}</p>
                        <p>Variance: {graphData[0].metrics.variance}</p>
                        <p>Standard Deviation: {graphData[0].metrics.stddev}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GraphPage;
