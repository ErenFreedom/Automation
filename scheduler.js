// scheduler.js
const cron = require('node-cron');
const { checkThresholds } = require('./controllers/monitorController');

// Schedule the task to run every minute
cron.schedule('* * * * *', () => {
    checkThresholds();
});
