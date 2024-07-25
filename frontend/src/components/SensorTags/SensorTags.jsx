import React, { useState, useEffect } from 'react';
import './SensorTags.css';

const SensorTags = () => {
    const [uniqueAPIs, setUniqueAPIs] = useState([]);
    const [mappings, setMappings] = useState([]);
    const [authToken, setAuthToken] = useState('');

    useEffect(() => {
        // Fetch auth token from Redis
        fetch('/api/get-auth-token')
            .then(response => response.json())
            .then(data => {
                setAuthToken(data.token);
                fetchUniqueAPIs(data.token);
            })
            .catch(error => console.error('Error fetching auth token:', error));
    }, []);

    const fetchUniqueAPIs = (token) => {
        fetch('https://ec2-3-109-41-79.ap-south-1.compute.amazonaws.com/api/sensors/get-unique-sensor-apis', {
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
        updatedMappings[index].tag = newTag;
        setMappings(updatedMappings);
    };

    const handleSubmit = () => {
        const updatedMappings = uniqueAPIs.map((api, index) => ({
            api,
            tag: mappings[index]?.tag || ''
        }));

        fetch('https://ec2-3-109-41-79.ap-south-1.compute.amazonaws.com/api/sensors/map-sensor-apis-to-tags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: authToken, mappings: updatedMappings })
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Mappings updated successfully') {
                    alert('Sensor tags updated successfully!');
                } else {
                    alert('Failed to update sensor tags.');
                }
            })
            .catch(error => console.error('Error updating sensor tags:', error));
    };

    return (
        <div className="sensor-tags-container">
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
            <button onClick={handleSubmit}>Save Tags</button>
        </div>
    );
};

export default SensorTags;
