const db = require('../config/db');
const moment = require('moment');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const sns = new AWS.SNS({ apiVersion: '2010-03-31' });

const verifyToken = (req) => {
    const token = req.headers.authorization.split(' ')[1];
    return jwt.verify(token, process.env.SECRET_KEY);
};

// Function to update query status to 'Pending'
exports.receiveQuery = (req, res) => {
    try {
        const decoded = verifyToken(req);
        const staffId = decoded.id;
        const { queryId } = req.body;

        const updateStatusQuery = `UPDATE query_status SET status = 'Pending', viewed_by = ?, viewed_at = NOW() WHERE query_id = ?`;
        db.query(updateStatusQuery, [staffId, queryId], (err, results) => {
            if (err) {
                console.error('Error updating query status to Pending:', err);
                return res.status(500).send('Error updating query status to Pending');
            }

            // Fetch client email and phone number
            const getClientDetailsQuery = `SELECT q.clientEmail, c.phoneNumber FROM queries q JOIN clients c ON q.clientEmail = c.email WHERE q.id = ?`;
            db.query(getClientDetailsQuery, [queryId], (err, results) => {
                if (err || results.length === 0) {
                    console.error('Error fetching client details:', err);
                    return res.status(500).send('Error fetching client details');
                }

                const clientDetails = results[0];

                // Send SMS to the client
                const params = {
                    Message: `Your query has been received and is now pending.`,
                    PhoneNumber: clientDetails.phoneNumber,
                };

                sns.publish(params, (err, data) => {
                    if (err) {
                        console.error('Error sending SMS:', err);
                        return res.status(500).send('Error sending SMS');
                    }

                    console.log('SMS sent:', data);
                    res.status(200).send('Query status updated to Pending and client notified');
                });
            });
        });
    } catch (err) {
        console.error('Invalid staffId:', err);
        return res.status(400).send('Invalid staffId');
    }
};

// Function to update query status to 'Closed'
exports.closeQuery = (req, res) => {
    try {
        const decoded = verifyToken(req);
        const staffId = decoded.id;
        const { queryId } = req.body;

        // First, fetch the viewed_at time and client email
        const getQueryDetailsQuery = `SELECT qs.viewed_at, q.clientEmail, c.phoneNumber FROM query_status qs JOIN queries q ON qs.query_id = q.id JOIN clients c ON q.clientEmail = c.email WHERE qs.query_id = ?`;
        db.query(getQueryDetailsQuery, [queryId], (err, results) => {
            if (err || results.length === 0) {
                console.error('Error fetching query details:', err);
                return res.status(500).send('Error fetching query details');
            }

            const viewedAt = results[0].viewed_at;
            const clientEmail = results[0].clientEmail;
            const clientPhoneNumber = results[0].phoneNumber;
            const closedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            const duration = moment(closedAt).diff(moment(viewedAt), 'minutes');

            // Update query status to 'Closed'
            const updateStatusQuery = `UPDATE query_status SET status = 'Closed', closed_by = ?, closed_at = ?, time_to_close = ? WHERE query_id = ?`;
            db.query(updateStatusQuery, [staffId, closedAt, duration, queryId], (err, results) => {
                if (err) {
                    console.error('Error updating query status to Closed:', err);
                    return res.status(500).send('Error updating query status to Closed');
                }

                // Insert into calls table
                const insertCallQuery = 'INSERT INTO calls (query_id, staff_id, duration) VALUES (?, ?, ?)';
                db.query(insertCallQuery, [queryId, staffId, duration], (err) => {
                    if (err) {
                        console.error('Error inserting into calls table:', err);
                        return res.status(500).send('Error inserting into calls table');
                    }

                    // Fetch full query details to send to the client
                    const getFullQueryDetailsQuery = `SELECT q.*, qs.status, qs.viewed_by, qs.closed_by, qs.viewed_at, qs.closed_at, qs.time_to_close
                                                      FROM queries q
                                                      JOIN query_status qs ON q.id = qs.query_id
                                                      WHERE q.id = ?`;
                    db.query(getFullQueryDetailsQuery, [queryId], (err, queryDetails) => {
                        if (err) {
                            console.error('Error fetching full query details:', err);
                            return res.status(500).send('Error fetching full query details');
                        }

                        const queryDetail = queryDetails[0];

                        // Send SMS to the client
                        const params = {
                            Message: `Your query has been resolved.\n\nQuery Details:\nSubject: ${queryDetail.subject}\nMessage: ${queryDetail.message}\nStatus: ${queryDetail.status}\nClosed By: ${queryDetail.closed_by}\nViewed At: ${queryDetail.viewed_at}\nClosed At: ${queryDetail.closed_at}\nTime to Close: ${queryDetail.time_to_close} minutes`,
                            PhoneNumber: clientPhoneNumber,
                        };

                        sns.publish(params, (err, data) => {
                            if (err) {
                                console.error('Error sending SMS:', err);
                                return res.status(500).send('Error sending SMS');
                            }

                            console.log('SMS sent:', data);
                            res.status(200).send('Query status updated to Closed and client notified');
                        });
                    });
                });
            });
        });
    } catch (err) {
        console.error('Invalid staffId:', err);
        return res.status(400).send('Invalid staffId');
    }
};

// Function to get query status for a client
exports.getClientQueries = (req, res) => {
    const { clientEmail } = req.params;

    const getQueriesQuery = `SELECT q.*, qs.status FROM queries q
                             JOIN query_status qs ON q.id = qs.query_id
                             WHERE q.clientEmail = ?`;
    db.query(getQueriesQuery, [clientEmail], (err, results) => {
        if (err) {
            console.error('Error fetching client queries:', err);
            return res.status(500).send('Error fetching client queries');
        }

        res.status(200).json(results);
    });
};

// Function to get query status for staff based on department
exports.getStaffQueries = (req, res) => {
    const { department } = req.params;

    const getQueriesQuery = `SELECT q.*, qs.status FROM queries q
                             JOIN query_status qs ON q.id = qs.query_id
                             WHERE q.department = ?`;
    db.query(getQueriesQuery, [department], (err, results) => {
        if (err) {
            console.error('Error fetching department queries:', err);
            return res.status(500).send('Error fetching department queries');
        }

        res.status(200).json(results);
    });
};
