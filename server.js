const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

const server = http.createServer(app);
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
const statusRoutes = require('./routes/statusRoutes'); // Add this line
const clientRoutes = require('./routes/clientRoutes');
const staffRoutes = require('./routes/staffRoutes');
const backdoorRoutes = require('./routes/backdoorRoutes');

app.use(bodyParser.json());
app.use(helmet());

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
app.use('/api', graphRoutes); // Adding the new route for graph data
app.use('/api', accountRoutes); // Adding the new route for account actions
app.use('/api', monitorRoutes); // Adding the new route for monitoring
app.use('/api', queryRoutes); // Adding the new route for queries
app.use('/api', statusRoutes); // Adding the new route for status management
app.use('/api', clientRoutes);
app.use('/api', staffRoutes);
app.use('/api', backdoorRoutes);

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
