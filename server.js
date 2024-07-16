const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// SSL Certificate and Key
const sslOptions = {
  key: fs.readFileSync('./key.pem'), 
    cert: fs.readFileSync('./cert.pem') 
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);
const socket = require('./socket');
const io = socket.init(server); // Initialize socket.io

const authRoutes = require('./routes/authRoutes');
const authClientRoutes = require('./routes/authClientRoutes');
const dataRoutes = require('./routes/dataRoutes');
const loggerRoutes = require('./routes/loggerRoutes');
const latestDataRoutes = require('./routes/latestDataRoutes');
const reportRoutes = require('./routes/reportRoutes');
const graphRoutes = require('./routes/graphRoutes');
const accountRoutes = require('./routes/accountRoutes');
const monitorRoutes = require('./routes/monitorRoutes');
const queryRoutes = require('./routes/queryRoutes');
const statusRoutes = require('./routes/statusRoutes');
const clientRoutes = require('./routes/clientRoutes');
const staffRoutes = require('./routes/staffRoutes');
const backdoorRoutes = require('./routes/backdoorRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const cloudRoutes = require('./routes/cloudRoutes');
const sensorDataRoutes = require('./routes/sensorDataRoutes');

// Import the MySQL client
const db = require('./config/db');

app.use(bodyParser.json({ limit: '50mb' })); // Increase the payload size limit for JSON
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Increase the payload size limit for URL-encoded data
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: 'https://ec2-3-109-41-79.ap-south-1.compute.amazonaws.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api', authRoutes);
app.use('/api', authClientRoutes);
app.use('/api', dataRoutes); // Ensure this is protected with token verification
app.use(loggerRoutes);
app.use('/api', latestDataRoutes); // Adding the new route for latest data
app.use('/api', reportRoutes); // Adding the new route for report generation
app.use('/api/graph', graphRoutes);// Adding the new route for graph data
app.use('/api', accountRoutes); // Adding the new route for account actions
app.use('/api', monitorRoutes); // Adding the new route for monitoring
app.use('/api', queryRoutes); // Adding the new route for queries
app.use('/api', statusRoutes); // Adding the new route for status management
app.use('/api', clientRoutes);
app.use('/api', staffRoutes);
app.use('/api', backdoorRoutes);
app.use('/api', sensorRoutes);
app.use('/api', cloudRoutes);
app.use('/api/sensor-data', sensorDataRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the scheduler
require('./scheduler');

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
