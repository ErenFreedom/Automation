import React, { useEffect, useState, useRef } from 'react';
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

    const chartRefs = useRef([]);

    useEffect(() => {
        dispatch(fetchGraphData(sensorApi, timeWindow));
    }, [dispatch, sensorApi, timeWindow]);

    const handleTimeWindowChange = (event) => {
        setTimeWindow(event.target.value);
    };

    const filterDataByTimeWindow = (data) => {
        if (!data || data.length === 0) return [];

        const now = new Date();
        let startTime;

        switch (timeWindow) {
            case '1day':
                startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '1week':
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '1month':
                startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                return data;
        }

        return data.filter(item => new Date(item.timestamp) >= startTime);
    };

    useEffect(() => {
        if (graphData && graphData.length > 0) {
            graphData.forEach((apiData, index) => {
                const ctx = chartRefs.current[index].getContext('2d');
                const filteredData = filterDataByTimeWindow(apiData.data);
                const sortedData = filteredData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                const datasets = [{
                    label: apiData.api,
                    data: sortedData.map(item => ({ x: new Date(item.timestamp), y: item.value })),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    fill: false,
                    spanGaps: true, // Handle gaps in the data
                }];

                if (ctx) {
                    new Chart(ctx, {
                        type: 'line',
                        data: { datasets },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            interaction: { mode: 'index', intersect: false },
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
                                    time: { unit: 'hour' },
                                    title: { display: true, text: 'Time' },
                                    ticks: { autoSkip: true, maxTicksLimit: 10 }
                                },
                                y: {
                                    beginAtZero: true,
                                    title: { display: true, text: 'Value' }
                                }
                            }
                        }
                    });
                }
            });
        }
    }, [graphData, sensorApi, timeWindow]);

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
                {graphData && graphData.length > 0 && graphData.map((apiData, index) => (
                    <canvas key={apiData.api} ref={el => chartRefs.current[index] = el} />
                ))}
            </div>
            <div className="metrics-container">
                {graphData && graphData.length > 0 && (
                    graphData.map(apiData => (
                        <div key={apiData.api}>
                            <h3>Metrics for {apiData.api}</h3>
                            <p>Average: {calculateMetric(apiData.data, 'average')}</p>
                            <p>Max: {calculateMetric(apiData.data, 'max')}</p>
                            <p>Min: {calculateMetric(apiData.data, 'min')}</p>
                            <p>Range: {calculateMetric(apiData.data, 'range')}</p>
                            <p>Variance: {calculateMetric(apiData.data, 'variance')}</p>
                            <p>Standard Deviation: {calculateMetric(apiData.data, 'stddev')}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const calculateMetric = (data, metricType) => {
    const values = data.map(item => item.value);
    if (values.length === 0) return 'N/A';

    const sum = values.reduce((a, b) => a + b, 0);
    const average = (sum / values.length).toFixed(2);
    const max = Math.max(...values).toFixed(2);
    const min = Math.min(...values).toFixed(2);
    const range = (max - min).toFixed(2);
    const variance = (values.reduce((a, b) => a + Math.pow(b - average, 2), 0) / values.length).toFixed(2);
    const stddev = Math.sqrt(variance).toFixed(2);

    switch (metricType) {
        case 'average': return average;
        case 'max': return max;
        case 'min': return min;
        case 'range': return range;
        case 'variance': return variance;
        case 'stddev': return stddev;
        default: return 'N/A';
    }
};

export default GraphPage;
