const db = require('../config/db');

exports.getStaffInfo = (req, res) => {
    const { userId } = req.user;  // Get the userId from the authenticated token

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    const query = 'SELECT id, email, department FROM staff WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching staff info:', err);
            return res.status(500).send('Error fetching staff info');
        }
        if (results.length === 0) {
            return res.status(404).send('Staff member not found');
        }
        res.status(200).json(results[0]);
    });
};
