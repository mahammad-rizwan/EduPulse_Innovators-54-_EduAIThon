// controllers/blogController.js
const db = require('../config/dbConnect');


exports.createReply = (req, res) => {
    const { question_id, description, date } = req.body;
    db.query('INSERT INTO Replies (question_id, description, date) VALUES (?, ?, ?)',
      [question_id, description, date],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ id: result.insertId, message: 'Reply created' });
      });
  };
  
  exports.getRepliesByQuestionId = (req, res) => {
    const { question_id } = req.params;
    db.query('SELECT * FROM Replies WHERE question_id = ?', [question_id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  };
  