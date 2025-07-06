// Create alumni
const createAlumni = (alumni, db) => {
    const sql = "INSERT INTO Alumni (password, name, school_id, graduation_year, occupation) VALUES (?, ?, ?, ?, ?)";
    return db.query(sql, [alumni.password, alumni.name, alumni.school_id, alumni.graduation_year, alumni.occupation]);
  };
  
  // Get alumni by ID
  const getAlumniById = (id, db) => {
    const sql = "SELECT * FROM Alumni WHERE id = ?";
    return db.query(sql, [id]);
  };
  