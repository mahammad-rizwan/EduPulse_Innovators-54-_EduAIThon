// Create reply
const createReply = (reply, db) => {
    const sql = "INSERT INTO Replies (question_id, description, date) VALUES (?, ?, ?)";
    return db.query(sql, [reply.question_id, reply.description, reply.date]);
  };
  
  // Get replies by question ID
  const getRepliesByQuestionId = (question_id, db) => {
    const sql = "SELECT * FROM Replies WHERE question_id = ?";
    return db.query(sql, [question_id]);
  };
  