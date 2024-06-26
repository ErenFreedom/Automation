const db = require('../config/db');
const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const pinpoint = new AWS.Pinpoint({ apiVersion: '2016-12-01' });

exports.viewQuery = (req, res) => {
    const { queryId, staffId } = req.body;

    const updateStatusQuery = `
        UPDATE query_status 
        SET status = 'Pending', viewed_by = ?, viewed_at = NOW() 
        WHERE query_id = ? AND status = 'Received'`;

    db.query(updateStatusQuery, [staffId, queryId], (err, results) => {
        if (err) {
            console.error('Error updating query status:', err);
            return res.status(500).send('Error viewing query');
        }

        // Fetch client details to send SMS
        const getClientQuery = 'SELECT clientEmail FROM queries WHERE id = ?';
        db.query(getClientQuery, [queryId], (err, clientResults) => {
            if (err) {
                console.error('Error fetching client details:', err);
                return res.status(500).send('Error fetching client details');
            }

            const clientEmail = clientResults[0].clientEmail;
            const getClientPhoneQuery = 'SELECT phoneNumber FROM clients WHERE email = ?';
            db.query(getClientPhoneQuery, [clientEmail], (err, phoneResults) => {
                if (err) {
                    console.error('Error fetching client phone number:', err);
                    return res.status(500).send('Error fetching client phone number');
                }

                const clientPhone = phoneResults[0].phoneNumber;
                const params = {
                    ApplicationId: process.env.PINPOINT_APPLICATION_ID,
                    MessageRequest: {
                        Addresses: {
                            [clientPhone]: {
                                ChannelType: 'SMS'
                            }
                        },
                        MessageConfiguration: {
                            SMSMessage: {
                                Body: `Your query with ID ${queryId} has been acknowledged. Please be patient while we work on it.`,
                                MessageType: 'TRANSACTIONAL'
                            }
                        }
                    }
                };

                pinpoint.sendMessages(params, (err, data) => {
                    if (err) {
                        console.error('Error sending SMS:', err);
                    } else {
                        console.log('SMS sent:', data);
                    }
                });

                res.status(200).send('Query viewed successfully');
            });
        });
    });
};

exports.closeQuery = (req, res) => {
    const { queryId, staffId } = req.body;

    const updateStatusQuery = `
        UPDATE query_status 
        SET status = 'Finished', closed_by = ?, closed_at = NOW(), 
            time_to_close = TIMESTAMPDIFF(SECOND, viewed_at, NOW())
        WHERE query_id = ? AND status = 'Pending'`;

    db.query(updateStatusQuery, [staffId, queryId], (err, results) => {
        if (err) {
            console.error('Error updating query status:', err);
            return res.status(500).send('Error closing query');
        }

        // Fetch client details to send SMS
        const getClientQuery = 'SELECT clientEmail FROM queries WHERE id = ?';
        db.query(getClientQuery, [queryId], (err, clientResults) => {
            if (err) {
                console.error('Error fetching client details:', err);
                return res.status(500).send('Error fetching client details');
            }

            const clientEmail = clientResults[0].clientEmail;
            const getClientPhoneQuery = 'SELECT phoneNumber FROM clients WHERE email = ?';
            db.query(getClientPhoneQuery, [clientEmail], (err, phoneResults) => {
                if (err) {
                    console.error('Error fetching client phone number:', err);
                    return res.status(500).send('Error fetching client phone number');
                }

                const clientPhone = phoneResults[0].phoneNumber;
                const params = {
                    ApplicationId: process.env.PINPOINT_APPLICATION_ID,
                    MessageRequest: {
                        Addresses: {
                            [clientPhone]: {
                                ChannelType: 'SMS'
                            }
                        },
                        MessageConfiguration: {
                            SMSMessage: {
                                Body: `Your query with ID ${queryId} has been resolved. Thank you for bearing with us.`,
                                MessageType: 'TRANSACTIONAL'
                            }
                        }
                    }
                };

                pinpoint.sendMessages(params, (err, data) => {
                    if (err) {
                        console.error('Error sending SMS:', err);
                    } else {
                        console.log('SMS sent:', data);
                    }
                });

                res.status(200).send('Query closed successfully');
            });
        });
    });
};

// Fetch queries for a specific department
exports.getQueries = (req, res) => {
    const { department } = req.params;

    if (!department) {
        return res.status(400).send('Department is required');
    }

    const selectQueries = `
        SELECT q.*, qs.status, qs.viewed_by, qs.closed_by, qs.viewed_at, qs.closed_at, qs.time_to_close 
        FROM queries q 
        JOIN query_status qs ON q.id = qs.query_id
        WHERE q.department = ? 
        ORDER BY q.created_at DESC`;

    db.query(selectQueries, [department], (err, results) => {
        if (err) {
            console.error('Error fetching queries:', err);
            return res.status(500).send('Error fetching queries');
        }
        res.status(200).json(results);
    });
};

// Fetch query details for a specific query
exports.getQueryDetails = (req, res) => {
    const { queryId } = req.params;

    if (!queryId) {
        return res.status(400).send('Query ID is required');
    }

    const selectQueryDetails = `
        SELECT q.*, qs.status, qs.viewed_by, qs.closed_by, qs.viewed_at, qs.closed_at, qs.time_to_close 
        FROM queries q 
        JOIN query_status qs ON q.id = qs.query_id
        WHERE q.id = ?`;

    db.query(selectQueryDetails, [queryId], (err, results) => {
        if (err) {
            console.error('Error fetching query details:', err);
            return res.status(500).send('Error fetching query details');
        }
        res.status(200).json(results[0]);
    });
};

// Fetch query status for a specific client
exports.getClientQueryStatus = (req, res) => {
    const { clientEmail } = req.params;

    if (!clientEmail) {
        return res.status(400).send('Client email is required');
    }

    const selectClientQueries = `
        SELECT q.*, qs.status, qs.viewed_by, qs.closed_by, qs.viewed_at, qs.closed_at, qs.time_to_close 
        FROM queries q 
        JOIN query_status qs ON q.id = qs.query_id
        WHERE q.clientEmail = ? 
        ORDER BY q.created_at DESC`;

    db.query(selectClientQueries, [clientEmail], (err, results) => {
        if (err) {
            console.error('Error fetching client queries:', err);
            return res.status(500).send('Error fetching client queries');
        }
        res.status(200).json(results);
    });
};
