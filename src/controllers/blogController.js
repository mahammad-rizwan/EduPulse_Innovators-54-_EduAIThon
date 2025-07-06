// controllers/blogController.js
const db = require('../config/dbConnect');

exports.createBlog = (req, res) => {
  const { title, description, alumni_id, uploaded_date, likes } = req.body;
  db.query('INSERT INTO Blogs (title, description, alumni_id, uploaded_date, likes) VALUES (?, ?, ?, ?, ?)',
    [title, description, alumni_id, uploaded_date, likes || 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId, message: 'Blog created' });
    });
};

exports.getBlogById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM Blogs WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
};

exports.getBlogsByAlumniId = (req, res) => {
  const { alumni_id } = req.params;
  db.query('SELECT * FROM Blogs WHERE alumni_id = ?', [alumni_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getBlogsBySchoolId = (req, res) => {
  const { school_id } = req.params;
  db.query(`SELECT b.* FROM Blogs b JOIN Alumni a ON b.alumni_id = a.id WHERE a.school_id = ?`,
    [school_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
};