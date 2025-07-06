// Create blog
const createBlog = (blog, db) => {
    const sql = "INSERT INTO Blogs (title, description, alumni_id, uploaded_date, likes) VALUES (?, ?, ?, ?, ?)";
    return db.query(sql, [blog.title, blog.description, blog.alumni_id, blog.uploaded_date, blog.likes || 0]);
  };
  
  // Get blog by ID
  const getBlogById = (id, db) => {
    const sql = "SELECT * FROM Blogs WHERE id = ?";
    return db.query(sql, [id]);
  };
  
  // Get blogs by alumni ID
  const getBlogsByAlumniId = (alumni_id, db) => {
    const sql = "SELECT * FROM Blogs WHERE alumni_id = ?";
    return db.query(sql, [alumni_id]);
  };
  
  // Get blogs by school ID (through join)
  const getBlogsBySchoolId = (school_id, db) => {
    const sql = `
      SELECT b.* FROM Blogs b
      JOIN Alumni a ON b.alumni_id = a.id
      WHERE a.school_id = ?`;
    return db.query(sql, [school_id]);
  };
  