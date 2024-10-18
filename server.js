const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');
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

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware configuration
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: 'https://ec2-13-126-117-233.ap-south-1.compute.amazonaws.com',

  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to disable caching
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Session management
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, sameSite: 'none' }
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});
app.use(limiter);

// Import routes
const authRoutes = require('./routes/authRoutes');
const authClientRoutes = require('./routes/authClientRoutes');
const dataRoutes = require('./routes/dataRoutes');
const loggerRoutes = require('./routes/loggerRoutes');
const latestDataRoutes = require('./routes/latestDataRoutes');
const reportRoutes = require('./routes/reportRoutes');
const graphRoutes = require('./routes/graphRoutes');
const accountRoutes = require('./routes/accountRoutes');
const queryRoutes = require('./routes/queryRoutes');
const statusRoutes = require('./routes/statusRoutes');
const clientRoutes = require('./routes/clientRoutes');
const staffRoutes = require('./routes/staffRoutes');
const backdoorRoutes = require('./routes/backdoorRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const cloudRoutes = require('./routes/cloudRoutes');
const sensorDataRoutes = require('./routes/sensorDataRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const clientSensorDataRoutes = require('./routes/clientSensorDataRoutes');
const clientGraphRoutes = require('./routes/clientGraphRoutes');
const clientReportRoutes = require('./routes/clientReportRoutes');
const clientNotificationRoutes = require('./routes/clientNotificationRoutes');
const sensorTagRoutes = require('./routes/sensorTagRoutes');

// Use routes
app.use('/api', authRoutes);
app.use('/api', authClientRoutes);
app.use('/api', dataRoutes);
app.use(loggerRoutes);
app.use('/api', latestDataRoutes);
app.use('/api', reportRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api', accountRoutes);
app.use('/api', queryRoutes);
app.use('/api', statusRoutes);
app.use('/api', clientRoutes);
app.use('/api', staffRoutes);
app.use('/api', backdoorRoutes);
app.use('/api', sensorRoutes);
app.use('/api', cloudRoutes);
app.use('/api/sensor-data', sensorDataRoutes);
app.use('/api', notificationRoutes);
app.use('/api/client-sensor-data', clientSensorDataRoutes);
app.use('/api/client-graph-data', clientGraphRoutes);
app.use('/api/client-report', clientReportRoutes);
app.use('/api', clientNotificationRoutes);
app.use('/api/sensor-tags', sensorTagRoutes);

// Start the scheduler
require('./scheduler');

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
