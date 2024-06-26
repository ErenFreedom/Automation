const db = require('../config/db');

exports.getStaffInfo = (req, res) => {
    const userId = req.user.id; // Assuming the user ID is stored in the token
    const getStaffQuery = 'SELECT * FROM staff WHERE id = ?';
    db.query(getStaffQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching staff info:', err);
            return res.status(500).send('Error fetching staff info');
        }
        if (results.length === 0) {
            return res.status(404).send('Staff not found');
        }
        res.status(200).json(results[0]);
    });
};
