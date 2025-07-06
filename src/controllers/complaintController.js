const db = require('../config/dbConnect'); 

// controllers/complaintController.js
exports.createComplaint = 
  
  exports.getComplaintById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Complaint WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results[0]);
    });
  };
  
  exports.getComplaintsBySchoolId = (req, res) => {
    const { school_id } = req.params;
    db.query('SELECT * FROM Complaint WHERE school_id = ?', [school_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  };