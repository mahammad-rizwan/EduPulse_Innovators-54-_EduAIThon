// Create question
const createQuestion = (question, db) => {
    const sql = "INSERT INTO Questions (description, school_id, student_id, date, status) VALUES (?, ?, ?, ?, ?)";
    return db.query(sql, [question.description, question.school_id, question.student_id, question.date, question.status]);
  };
  
  // Get questions by school ID
  const getQuestionsBySchoolId = (school_id, db) => {
    const sql = "SELECT * FROM Questions WHERE school_id = ?";
    return db.query(sql, [school_id]);
  };
  
  // Get questions by status
  const getQuestionsByStatus = (status, db) => {
    const sql = "SELECT * FROM Questions WHERE status = ?";
    return db.query(sql, [status]);
  };
  