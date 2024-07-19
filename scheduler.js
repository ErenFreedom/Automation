const cron = require('node-cron');
const notificationsController = require('./controllers/notificationController');

// Schedule the task to run every minute
cron.schedule('* * * * *', () => {
    console.log('Running threshold check...');
    notificationsController.checkThresholds();
});
