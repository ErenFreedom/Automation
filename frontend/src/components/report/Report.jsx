import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReport } from '../../actions/reportActions';
import './Report.css';

const Report = () => {
    const dispatch = useDispatch();
    const [timeOption, setTimeOption] = useState('today');
    const [hours, setHours] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [format, setFormat] = useState('csv');
    const loading = useSelector((state) => state.report.loading);
    const error = useSelector((state) => state.report.error);

    const convertToISO = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return new Date(`${year}-${month}-${day}`).toISOString();
    };

    const handleGenerateReport = async () => {
        let params = {
            timeOption,
            format,
        };

        if (timeOption === 'today') {
            params.hours = hours;
        } else if (timeOption === 'custom') {
            params.startTime = convertToISO(startDate);
            params.endTime = convertToISO(endDate);
        }

        const fileData = await dispatch(fetchReport(params));

        if (fileData) {
            const url = window.URL.createObjectURL(new Blob([fileData]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }
    };

    return (
        <div className="report-page-container">
            <div className="report-form">
                <h2>Generate Report</h2>

                <label htmlFor="timeOption">Select Time Option:</label>
                <select id="timeOption" value={timeOption} onChange={(e) => setTimeOption(e.target.value)}>
                    <option value="today">Today</option>
                    <option value="custom">Custom</option>
                </select>

                {timeOption === 'today' && (
                    <div>
                        <label htmlFor="hours">Select Hours:</label>
                        <select id="hours" value={hours} onChange={(e) => setHours(e.target.value)}>
                            {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i + 1}>
                                    {i + 1} {i + 1 === 1 ? 'hour' : 'hours'}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {timeOption === 'custom' && (
                    <div>
                        <label htmlFor="startDate">Start Date (dd/mm/yyyy):</label>
                        <input
                            type="text"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <label htmlFor="endDate">End Date (dd/mm/yyyy):</label>
                        <input
                            type="text"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                )}

                <label htmlFor="format">Select Format:</label>
                <select id="format" value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                </select>

                <button onClick={handleGenerateReport} disabled={loading}>
                    {loading ? 'Generating Report...' : 'Generate Report'}
                </button>

                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
};

export default Report;
