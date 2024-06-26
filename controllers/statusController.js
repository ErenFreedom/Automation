const db = require('../config/db');

// Mark query as viewed
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
        res.status(200).send('Query viewed successfully');
    });
};

// Mark query as closed
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
        res.status(200).send('Query closed successfully');
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

// Fetch details for a specific query
exports.getQueryDetails = (req, res) => {
    const { queryId } = req.params;

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
        if (results.length === 0) {
            return res.status(404).send('Query not found');
        }
        res.status(200).json(results[0]);
    });
};
