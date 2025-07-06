// controllers/studentController.js
const db = require('../config/dbConnect');

exports.createStudent = async (req, res) => {
  try {
    console.log(req.body);
    const { id, password, name, school_id, class: studentClass } = req.body;

    const [result] = await db.promise().query(
      'INSERT INTO Student (id, password, name, school_id, class) VALUES (?, ?, ?, ?, ?)',
      [id, password, name, school_id, studentClass]
    );

    res.status(201).json({ id: result.insertId, message: 'Student created' });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.promise().query('SELECT * FROM Student WHERE id = ?', [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ error: err.message });
  }
};
