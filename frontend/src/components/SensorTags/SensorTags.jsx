import React, { useState, useEffect } from 'react';
import './SensorTags.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SensorTags = () => {
    const [uniqueAPIs, setUniqueAPIs] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [authToken, setAuthToken] = useState('');

    useEffect(() => {
        // Fetch auth token from local storage
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
            fetchUniqueAPIs(token);
        }
    }, []);

    const fetchUniqueAPIs = (token) => {
        fetch('https://ec2-3-109-41-79.ap-south-1.compute.amazonaws.com/api/sensor-tags/get-unique-sensor-apis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        })
            .then(response => response.json())
            .then(data => setUniqueAPIs(data.uniqueAPIs))
            .catch(error => console.error('Error fetching unique APIs:', error));
    };

    const handleMappingChange = (index, newTag) => {
        const updatedMappings = [...mappings];
        updatedMappings[index] = { ...updatedMappings[index], tag: newTag };
        setMappings(updatedMappings);
    };

    const handleSubmit = () => {
        const updatedMappings = uniqueAPIs.map((api, index) => ({
            api,
            tag: mappings[index]?.tag || ''
        }));

        fetch('https://ec2-3-109-41-79.ap-south-1.compute.amazonaws.com/api/sensor-tags/map-sensor-apis-to-tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: authToken, mappings: updatedMappings })
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Mappings updated successfully') {
                    toast.success('Sensor tags updated successfully!');
                } else {
                    toast.error('Failed to update sensor tags.');
                }
            })
            .catch(error => {
                console.error('Error updating sensor tags:', error);
                toast.error('Failed to update sensor tags.');
            });
    };

    return (
        <div className="sensor-tags-container">
            <ToastContainer />
            <h2>Configure Sensor Tags</h2>
            <p>Map your sensor APIs to meaningful tags.</p>
            <div className="sensor-tags-form">
                {uniqueAPIs.map((api, index) => (
                    <div key={index} className="sensor-tag-item">
                        <label>API: {api}</label>
                        <input
                            type="text"
                            placeholder="Enter Tag Name"
                            value={mappings[index]?.tag || ''}
                            onChange={(e) => handleMappingChange(index, e.target.value)}
                        />
                    </div>
                ))}
            </div>
            <button className="sensor-tags-submit-button" onClick={handleSubmit}>Save Tags</button>
        </div>
    );
};

export default SensorTags;
