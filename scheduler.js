const cron = require('node-cron');
const notificationsController = require('./controllers/notificationController');

// Schedule the task to run every minute
cron.schedule('* * * * *', async () => {
    console.log('Running threshold check...');
    try {
        await notificationsController.checkThresholds();
    } catch (error) {
        console.error('Error during threshold check:', error);
    }
});
