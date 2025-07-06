const db = require('../config/dbConnect'); 

// controllers/alumniController.js
exports.createAlumni = (req, res) => {
    const { id,password, name, school_id, graduation_year, occupation } = req.body;
    db.query('INSERT INTO Alumni (id,password, name, school_id, graduation_year, occupation) VALUES (?,?, ?, ?, ?, ?)',
      [id,password, name, school_id, graduation_year, occupation],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ id: result.insertId, message: 'Alumni created' });
      });
  };
  
  exports.getAlumniById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Alumni WHERE id = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results[0]);
    });
  };
  