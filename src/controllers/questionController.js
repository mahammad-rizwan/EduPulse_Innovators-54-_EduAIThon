
// controllers/blogController.js
const db = require('../config/dbConnect');

exports.createQuestion = (req, res) => {
    const { description, school_id, student_id, date, status } = req.body;
    db.query('INSERT INTO Questions (description, school_id, student_id, date, status) VALUES (?, ?, ?, ?, ?)',
      [description, school_id, student_id, date, status],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ id: result.insertId, message: 'Question created' });
      });
  };
  
  exports.getQuestionsBySchoolId = (req, res) => {
    const { school_id } = req.params;
    db.query('SELECT * FROM Questions WHERE school_id = ?', [school_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  };
  
  exports.getQuestionsByStatus = (req, res) => {
    const { status } = req.params;
    db.query('SELECT * FROM Questions WHERE status = ?', [status], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  };