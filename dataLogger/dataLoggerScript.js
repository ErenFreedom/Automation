const axios = require('axios');
require('dotenv').config();

const localServerUrl = 'https://192.168.22.160/WebServiceApplication/api/token';
const username = 'defaultadmin';
const password = 'desigo';
const fetchDataUrl = 'https://192.168.22.160:443/WebServiceApplication/api/values/System1.LogicalView:LogicalView.BACNETNETWORK.B.F1.SA1.plant.T;.Present_Value';
const middlewareUrl = 'http://localhost:3000/data'; // Middleware API URL

// Function to authenticate and get a token
const getToken = async () => {
    try {
        const response = await axios.post(
            localServerUrl,
            `grant_type=password&username=${username}&password=${password}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting token:', error);
        process.exit(1);
    }
};

// Function to fetch data using the token
const fetchData = async (token) => {
    try {
        const response = await axios.get(fetchDataUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });

        const data = response.data;
        const logEntry = {
            type: data.DataType,
            value: parseFloat(data.Value.Value),
            timestamp: new Date(data.Value.Timestamp)
        };

        // Send data to middleware
        await axios.post(middlewareUrl, logEntry);
        console.log('Data sent to middleware:', logEntry);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Function to start the data fetching loop
const startFetchingData = async (interval) => {
    const token = await getToken();
    setInterval(() => fetchData(token), interval);
};

console.log('Starting data fetching...');
startFetchingData(30000); // Fetch data every 30 seconds
