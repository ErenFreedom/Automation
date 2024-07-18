import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGraphData } from '../../actions/graphActions';
import './GraphPage.css';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const GraphPage = () => {
    const { sensorApi, userId } = useParams();
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
            const ctx = document.getElementById('graphCanvas').getContext('2d');

            // Destroy any existing chart instance
            if (window.myChart) {
                window.myChart.destroy();
            }

            const datasets = graphData.map(apiData => ({
                label: apiData.api,
                data: apiData.data.map(item => ({ x: new Date(item.timestamp), y: item.value })),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
            }));

            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: datasets,
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour'
                            },
                            title: {
                                display: true,
                                text: 'Time'
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
    }, [graphData]);

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
                    <canvas id="graphCanvas" />
                )}
            </div>
            <div className="metrics-container">
                {graphData && graphData.map(apiData => (
                    <div key={apiData.api}>
                        <h3>Metrics for {apiData.api}</h3>
                        <p>Average: {apiData.metrics.average}</p>
                        <p>Max: {apiData.metrics.max}</p>
                        <p>Min: {apiData.metrics.min}</p>
                        <p>Range: {apiData.metrics.range}</p>
                        <p>Variance: {apiData.metrics.variance}</p>
                        <p>Standard Deviation: {apiData.metrics.stddev}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GraphPage;
