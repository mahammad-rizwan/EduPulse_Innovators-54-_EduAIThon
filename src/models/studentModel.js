// Create student
const createStudent = (student, db) => {
    const sql = "INSERT INTO Student (password, name, school_id, class) VALUES (?, ?, ?, ?)";
    return db.query(sql, [student.password, student.name, student.school_id, student.class]);
  };
  
  // Get student by ID
  const getStudentById = (id, db) => {
    const sql = "SELECT * FROM Student WHERE id = ?";
    return db.query(sql, [id]);
  };
  