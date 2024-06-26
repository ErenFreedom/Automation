const db = require('../config/db');

exports.getStaffInfo = (req, res) => {
  const userId = req.query.userId; // Use query parameter for testing
  if (!userId) {
    return res.status(400).send('User ID is required');
  }

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
