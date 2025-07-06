// Create school
const createSchool = (school, db) => {
    const sql = "INSERT INTO School (password, name, address) VALUES (?, ?, ?)";
    return db.query(sql, [school.password, school.name, school.address]);
  };
  
  // Get school by ID
  const getSchoolById = (id, db) => {
    const sql = "SELECT * FROM School WHERE id = ?";
    return db.query(sql, [id]);
  };
  