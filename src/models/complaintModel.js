// Create complaint
const createComplaint = (complaint, db) => {
    const sql = "INSERT INTO Complaint (type, subject_description, school_id, date_of_incident, expected_outcome, status) VALUES (?, ?, ?, ?, ?, ?)";
    return db.query(sql, [complaint.type, complaint.subject_description, complaint.school_id, complaint.date_of_incident, complaint.expected_outcome, complaint.status]);
  };
  
  // Get complaint by ID
  const getComplaintById = (id, db) => {
    const sql = "SELECT * FROM Complaint WHERE id = ?";
    return db.query(sql, [id]);
  };
  
  // Get complaints by school ID
  const getComplaintsBySchoolId = (school_id, db) => {
    const sql = "SELECT * FROM Complaint WHERE school_id = ?";
    return db.query(sql, [school_id]);
  };
  