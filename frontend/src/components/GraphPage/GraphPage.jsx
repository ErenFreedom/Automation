import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGraphData } from '../../actions/graphActions';
import './GraphPage.css';
import Chart from 'chart.js/auto';

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
        if (graphData && graphData.data && graphData.data.length > 0) {
            const ctx = document.getElementById('graphCanvas').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: graphData.data.map(item => new Date(item.timestamp).toLocaleString()),
                    datasets: [{
                        label: sensorApi,
                        data: graphData.data.map(item => item.value),
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false,
                    }],
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour'
                            }
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
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
                {graphData && graphData.data && (
                    <canvas id="graphCanvas" />
                )}
            </div>
            <div className="metrics-container">
                {graphData && graphData.metrics && (
                    <>
                        <p>Average: {graphData.metrics.average}</p>
                        <p>Max: {graphData.metrics.max}</p>
                        <p>Min: {graphData.metrics.min}</p>
                        <p>Range: {graphData.metrics.range}</p>
                        <p>Variance: {graphData.metrics.variance}</p>
                        <p>Standard Deviation: {graphData.metrics.stddev}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default GraphPage;
