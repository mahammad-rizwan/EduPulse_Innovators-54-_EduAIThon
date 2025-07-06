const path = require('path');
const express = require('express');
const app = express();
const db = require('./src/config/dbConnect');

const session = require('express-session');

app.use(session({
  secret: 'yourSecretKey',      // 🔒 change this to a strong secret
  resave: false,
  saveUninitialized: true
}));



const cors = require('cors');
require('dotenv').config();

app.use(cors());









// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'view'));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/chatbot', express.static(path.join(__dirname, '../frontend/dist')));


const blogsRoute = require('./chatbotRoute');
app.use('/api', blogsRoute);

app.get('/show-chatbot', (req, res) => {
  res.render('chatbot'); // This refers to src/view/chatbot.ejs
});


app.post('/submit-complaint', async (req, res) => { 
  try {
    console.log(req.body);
    const { type, subject_description, school_id, date_of_incident, expected_outcome, status, submitted_by } = req.body;

    const [result] = await db.query(
      'INSERT INTO Complaint (type, subject_description, school_id, date_of_incident, expected_outcome, status, submitted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [type, subject_description, school_id, date_of_incident, expected_outcome, status, submitted_by]
    );

    res.status(201).json({ id: result.insertId, message: 'Complaint created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/authority/create-student', async (req, res) => {
  try {
    console.log(req.body);
    const { id, password, name, school_id, class: studentClass } = req.body;

    const [result] = await db.query(
      'INSERT INTO Student (id, password, name, school_id, class) VALUES (?, ?, ?, ?, ?)',
      [id, password, name, school_id, studentClass]
    );

    res.status(201).json({ id: result.insertId, message: 'Student created' });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/authority/create-alumni', async (req, res) => {
  try {
    const { id, password, name, school_id, graduation_year, occupation } = req.body;

    const [result] = await db.query(
      'INSERT INTO Alumni (id, password, name, school_id, graduation_year, occupation) VALUES (?, ?, ?, ?, ?, ?)',
      [id, password, name, school_id, graduation_year, occupation]
    );

    res.status(201).json({ id: result.insertId, message: 'Alumni created' });
  } catch (err) {
    console.error('Error creating alumni:', err);
    res.status(500).json({ error: err.message });
  }
});





// Routes
app.get('/', (req, res) => res.render('home1'));
app.get('/viewServices', (req, res) => res.render('sLogin'));
app.get('/create-blog', (req, res) => {
  console.log('Query params:', req.query); // Check if success=1 appears on first load
  const success = req.query.success === '1';
  res.render('blog', { success });
});
app.get('/ask-question', (req, res) => {
  console.log('Query params:', req.query); // Check if success=1 appears on first load
  const success = req.query.success === '1';
  res.render('question', { success });
});


// Student Login
app.post('/sLogin', async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).render('error', { message: "All fields are required" });
  }

  try {
    const [results] = await db.query("SELECT * FROM student WHERE id = ?", [id]);
    
    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).render('error', { message: "Invalid ID or password" });
    }
    req.session.alumni_id = results[0].id;
    res.redirect('studentServicelogin');
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).render('error', { message: "Internal server error" });
  }
});



app.post('/submit-blog', async (req, res) => {
  const { title, description, uploaded_date } = req.body;

  // Use actual alumni_id from session in real app
  const alumni_id = req.session.alumni_id; 

  const [alumniRows] = await db.query(
    `SELECT school_id FROM alumni WHERE id = ?`,
    [alumni_id]
  );
  const school_id = alumniRows[0].school_id;

  

  if (!alumni_id || !school_id) {
    return res.status(401).send('Unauthorized: Alumni or school not identified.');
  }

  if (!title || !description) {
    return res.status(400).send('Title and description are required.');
  }

  const dateToInsert = uploaded_date || new Date().toISOString().split('T')[0];

  try {
    const [result] = await db.query(
      `INSERT INTO blogs (title, description, alumni_id, uploaded_date, school_id) VALUES (?, ?, ?, ?, ?)`,
      [title, description, alumni_id, dateToInsert, school_id]
    );

    console.log('Blog inserted:', result.insertId);
    res.redirect('/create-blog?success=1');
  } catch (err) {
    console.error('Error inserting blog:', err);
    res.status(500).send('Something went wrong while submitting your blog.');
  }
});



app.post('/submit-question', async (req, res) => {
  console.log(req.body);
  const { title, description, uploaded_date, type } = req.body;
  const student_id = req.session.alumni_id; // or however you’re tracking the user
  const [studentRows] = await db.query(
    `SELECT school_id FROM student WHERE id = ?`,
    [student_id]
  );

  const school_id = studentRows[0].school_id;
  console.log(school_id)

  try {
    if (type === 'blog') {
      await db.query(
        'INSERT INTO studentblog (title, description, student_id, uploaded_date, school_id) VALUES (?, ?, ?, ?, ?)',
        [title, description, student_id, uploaded_date, school_id]
      );
    } else if (type === 'query') {
      await db.query(
        'INSERT INTO question (title, description, student_id, uploaded_date, status, school_id) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, student_id, uploaded_date, 'pending', school_id]
      );
    }

    res.render('question', { success: true }); // adjust view name if needed
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong!');
  }
});



// app.post('/submit-question', async (req, res) => {
//   const { title, description, uploaded_date } = req.body;

//   // Get student_id from session
//   const student_id = req.session.alumni_id; // Assuming you store student_id in session

//   if (!student_id) {
//     return res.status(401).send('Unauthorized: Please log in as a student.');
//   }

//   if (!title || !description) {
//     return res.status(400).send('Title and description are required.');
//   }

//   const dateToInsert = uploaded_date || new Date().toISOString().split('T')[0];

//   try {
//     // First, get the school_id from the students table
//     const [studentRows] = await db.query(
//       `SELECT school_id FROM student WHERE id = ?`,
//       [student_id]
//     );

//     if (studentRows.length === 0) {
//       return res.status(404).send('Student not found.');
//     }

//     const school_id = studentRows[0].school_id;

//     // Then insert the blog with the retrieved school_id
//     const [result] = await db.query(
//       `INSERT INTO studentblog (title, description, student_id, uploaded_date, school_id) VALUES (?, ?, ?, ?, ?)`,
//       [title, description, student_id, dateToInsert, school_id]
//     );

//     console.log('Blog inserted:', result.insertId);
//     res.redirect('/ask-question?success=1');
//   } catch (err) {
//     console.error('Error inserting blog:', err);
//     res.status(500).send('Something went wrong while submitting your blog.');
//   }
// });


// School Login
app.post('/scLogin', async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).render('error', { message: "All fields are required" });
  }

  try {
    const [results] = await db.query("SELECT * FROM school WHERE id = ?", [id]);
    
    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).render('error', { message: "Invalid ID or password" });
    }

    res.redirect('/schoolHome');
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).render('error', { message: "Internal server error" });
  }
});
// ho Login
app.post('/hoLogin', async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).render('error', { message: "All fields are required" });
  }

  try {
    const [results] = await db.query("SELECT * FROM HigherOfficials WHERE id = ?", [id]);
    
    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).render('error', { message: "Invalid ID or password" });
    }

    res.redirect('/official-dashboard');
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).render('error', { message: "Internal server error" });
  }
});


//Alumni Login


app.post('/alumniLogin', async (req, res) => {
  const { id, password } = req.body;
  console.log(req.body);

  if (!id || !password) {
    return res.status(400).render('error', { message: "All fields are required" });
  }

  try {
    const [results] = await db.query("SELECT * FROM alumni WHERE id = ?", [id]);

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).render('error', { message: "Invalid ID or password" });
    }

    // Set session values for future access
    req.session.alumni_id = results[0].id;

    res.redirect('/alumniHome');
  } catch (err) {
    console.error("Error during alumni login:", err);
    res.status(500).render('error', { message: "Internal server error" });
  }
});


// Simple route handlers
app.get('/studentServicelogin', (req, res) => res.render('ss'));
app.get('/file-complaint', (req, res) => res.render('file-complaint'));
app.get('/authority-login', (req, res) => res.render('schoolLogin'));
app.get('/hoLogin', (req, res) => res.render('hoLogin'));
app.get('/alumniLogin', (req, res) => res.render('alumniLogin'));
app.get('/schoolHome', (req, res) => res.render('schoolHome'));
app.get('/authority/create-student', (req, res) => res.render('createStudent'));
app.get('/authority/create-alumni', (req, res) => res.render('createAlumni'));
app.get('/authority/raise-complaint', (req, res) => res.render('fileComplaintSchool'));
app.get('/official-dashboard', (req, res) => res.render('hoHome'));
app.get('/alumni-dashboard', (req, res) => res.render('alumniHome'));
app.get('/ho/authority/create-school', (req, res) => res.render('createSchool'));

// Complaint Resolution
app.get('/authority/resolve-complaint', async (req, res) => {
  try {
    const [pendingComplaints] = await db.query("SELECT * FROM Complaint WHERE status != 'Resolved'");
    const [resolvedComplaints] = await db.query("SELECT * FROM Complaint WHERE status = 'Resolved'");
    res.render('resComplaint', { pendingComplaints, resolvedComplaints });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).render('error', { message: "Internal server error" });
  }
});

// View Complaint
app.get('/authority/view-complaint/:id', async (req, res) => {
  try {
    const [complaint] = await db.query("SELECT * FROM Complaint WHERE id = ?", [req.params.id]);
    
    if (complaint.length === 0) {
      return res.status(404).render('error', { message: "Complaint not found" });
    }

    res.render('viewComplaint', { complaint: complaint[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).render('error', { message: "Internal server error" });
  }
});
app.get('/ho/authority/view-complaint/:id', async (req, res) => {
  try {
    const [complaint] = await db.query("SELECT * FROM Complaint WHERE id = ?", [req.params.id]);
    
    if (complaint.length === 0) {
      return res.status(404).render('error', { message: "Complaint not found" });
    }

    res.render('hoView', { complaint: complaint[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).render('error', { message: "Internal server error" });
  }
});


// GET request to load the complaint resolution page by complaint id
app.get('/authority/resolve/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [complaints] = await db.query("SELECT * FROM Complaint WHERE id = ?", [id]);
    if (complaints.length === 0) {
      return res.status(404).send("Complaint not found");
    }
    res.render('pendingComplaint', { complaint: complaints[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal server error");
  }
});
app.get('/ho/authority/resolve/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [complaints] = await db.query("SELECT * FROM Complaint WHERE id = ?", [id]);
    if (complaints.length === 0) {
      return res.status(404).send("Complaint not found");
    }
    res.render('hoPending', { complaint: complaints[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal server error");
  }
});



// Resolve Complaint
app.post('/authority/resolved/:id', async (req, res) => {
  try {
    await db.query(
      "UPDATE Complaint SET resolution_description = ?, status = 'Resolved' WHERE id = ?",
      [req.body.resolution, req.params.id]
    );
    res.redirect('/authority/resolve-complaint');
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).render('error', { message: "Internal Server Error" });
  }
});
app.post('/ho/authority/resolved/:id', async (req, res) => {
  try {
    await db.query(
      "UPDATE Complaint SET resolution_description = ?, status = 'Resolved' WHERE id = ?",
      [req.body.resolution, req.params.id]
    );
    res.redirect('/authority/resolve-complaint');
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).render('error', { message: "Internal Server Error" });
  }
});

app.post('/ho/authority/create-student', async (req, res) => {
  try {
    console.log(req.body);
    const { id, password, name, address } = req.body;

    const [result] = await db.query(
      "INSERT INTO School (id, password, name, address) VALUES (?, ?, ?, ?)",
      [id, password, name, address]
    );

    res.status(201).json({ id: result.insertId, message: 'School created' });
  } catch (err) {
    console.error("Error creating school:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/ho/authority/resolve-complaint', async (req, res) => {
    try {
      const [pendingComplaints] = await db.query("SELECT * FROM Complaint WHERE status != 'Resolved'");
      const [resolvedComplaints] = await db.query("SELECT * FROM Complaint WHERE status = 'Resolved'");
      res.render('hoResComplaint', { pendingComplaints, resolvedComplaints });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).render('error', { message: "Internal server error" });
    }
  });



  const { getAIResponse, searchInternet, getCareerOpportunities } = require('./src/services/groqService');

// Explore mentorship page route

app.get('/explore-mentorship', async (req, res) => {
  try {
    const studentId = req.session.alumni_id; // Changed from alumni_id to student_id

    if (!studentId) {
      return res.status(401).render('error', { message: 'Unauthorized: Please log in.' });
    }

    // Step 1: Get school_id of the logged-in student
    const [[studentRow]] = await db.query(
      'SELECT school_id FROM student WHERE id = ?',
      [studentId]
    );

    if (!studentRow) {
      return res.status(404).render('error', { message: 'Student not found' });
    }

    const schoolId = studentRow.school_id;

    // Step 2: Fetch alumni blogs
    const [alumniBlogs] = await db.query(
      `SELECT b.*, a.name AS author_name, a.graduation_year, a.occupation
       FROM Blogs b
       JOIN Alumni a ON b.alumni_id = a.id
       WHERE a.school_id = ?
       ORDER BY b.uploaded_date DESC`,
      [schoolId]
    );

    // Step 3: Fetch student blogs
    const [studentBlogs] = await db.query(
      `SELECT b.*, s.name AS author_name
       FROM studentblog b
       JOIN Student s ON b.student_id = s.id
       WHERE s.school_id = ?
       ORDER BY b.uploaded_date DESC`,
      [schoolId]
    );

    // Step 4: Render explore mentorship page with both blog types
    res.render('mm', {
      alumniBlogs: alumniBlogs.map(blog => ({
        ...blog,
        grad_year: blog.graduation_year
      })),
      studentBlogs: studentBlogs
    });

  } catch (err) {
    console.error('Error loading explore mentorship:', err);
    res.status(500).render('error', {
      message: 'Failed to load mentorship content',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


app.get('/my-questions', async (req, res) => {
  const student_id = req.session.alumni_id;
  const [questions] = await db.query('SELECT * FROM question WHERE student_id = ?', [student_id]);
  res.render('myQuestion', { questions });
});


app.get('/question/:id', async (req, res) => {
  const questionId = req.params.id;
  const [rows] = await db.query('SELECT * FROM question WHERE id = ?', [questionId]);

  if (rows.length === 0) return res.status(404).send('Question not found');
  
  const question = rows[0];

  // Optionally get replies if needed
  const [replies] = await db.query('SELECT * FROM replies WHERE question_id = ?', [questionId]);

  res.render('questionView', { question, replies });
});

app.get('/alumni/questions/:id', async (req, res) => {
  const questionId = req.params.id;
  const [rows] = await db.query('SELECT * FROM question WHERE id = ?', [questionId]);

  if (rows.length === 0) return res.status(404).send('Question not found');
  
  const question = rows[0];

  // Optionally get replies if needed
  const [replies] = await db.query('SELECT * FROM replies WHERE question_id = ?', [questionId]);

  res.render('alumniQuestionView', { question, replies });
});


app.post('/question/:id/reply', async (req, res) => {
  const { message } = req.body;
  const questionId = req.params.id;
  const alumni_id = req.session.alumni_id;

  try {
    // Step 1: Get alumni name from the alumni table
    const [alumniResult] = await db.query('SELECT name FROM alumni WHERE id = ?', [alumni_id]);
    
    if (alumniResult.length === 0) {
      return res.status(404).send('Alumni not found.');
    }

    const alumni_name = alumniResult[0].name;

    // Step 2: Insert the reply
    await db.query(
      'INSERT INTO replies (question_id, reply, replier_name, replied_at) VALUES (?, ?, ?, CURDATE())',
      [questionId, message, alumni_name]
    );

    // Step 3: Update question status to 'resolved'
    await db.query(
      'UPDATE question SET status = ? WHERE id = ?',
      ['resolved', questionId]
    );

    res.redirect(`/alumni/questions/${questionId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});



app.get('/alumni/queries', async (req, res) => {
  const alumni_id = req.session.alumni_id;

  try {
    // Get the school_id of the logged-in alumni
    const [alumniRows] = await db.query('SELECT school_id FROM alumni WHERE id = ?', [alumni_id]);
    if (alumniRows.length === 0) {
      return res.status(404).send('Alumni not found');
    }

    const school_id = alumniRows[0].school_id;

    // Fetch questions matching the alumni's school_id and status
    const [pending] = await db.query(
      "SELECT * FROM question WHERE status = 'pending' AND school_id = ?",
      [school_id]
    );
    const [resolved] = await db.query(
      "SELECT * FROM question WHERE status = 'resolved' AND school_id = ?",
      [school_id]
    );

    res.render('alumniQuestions', { pending, resolved });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get('/alumniHome', async (req, res) => {
  try {
    const studentId = req.session.alumni_id; // Changed from alumni_id to student_id

    if (!studentId) {
      return res.status(401).render('error', { message: 'Unauthorized: Please log in.' });
    }

    // Step 1: Get school_id of the logged-in student
    const [[studentRow]] = await db.query(
      'SELECT school_id FROM alumni WHERE id = ?',
      [studentId]
    );

    if (!studentRow) {
      return res.status(404).render('error', { message: 'Student not found' });
    }

    const schoolId = studentRow.school_id;

    // Step 2: Fetch alumni blogs
    const [alumniBlogs] = await db.query(
      `SELECT b.*, a.name AS author_name, a.graduation_year, a.occupation
       FROM Blogs b
       JOIN Alumni a ON b.alumni_id = a.id
       WHERE a.school_id = ?
       ORDER BY b.uploaded_date DESC`,
      [schoolId]
    );

    // Step 3: Fetch student blogs
    const [studentBlogs] = await db.query(
      `SELECT b.*, s.name AS author_name
       FROM studentblog b
       JOIN Student s ON b.student_id = s.id
       WHERE s.school_id = ?
       ORDER BY b.uploaded_date DESC`,
      [schoolId]
    );

    // Step 4: Render explore mentorship page with both blog types
    res.render('alumniHome', {
      alumniBlogs: alumniBlogs.map(blog => ({
        ...blog,
        grad_year: blog.graduation_year
      })),
      studentBlogs: studentBlogs
    });

  } catch (err) {
    console.error('Error loading explore mentorship:', err);
    res.status(500).render('error', {
      message: 'Failed to load mentorship content',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});



app.get('/blog/:id', async (req, res) => {
  const blogId = req.params.id;
  console.log(blogId);

  try {
    // Fetch blog with alumni name
    const [blogData] = await db.query(`
      SELECT blogs.*, alumni.name AS author_name 
      FROM blogs 
      JOIN alumni ON blogs.alumni_id = alumni.id 
      WHERE blogs.id = ?
    `, [blogId]);

    if (blogData.length === 0) {
      return res.status(404).render('error', { message: 'Blog not found' });
    }

    // Format date and time
    const blog = blogData[0];
    const dateObj = new Date(blog.uploaded_date);
    blog.formatted_date = dateObj.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    blog.formatted_time = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    // Fetch comments
    const [comments] = await db.query('SELECT * FROM comments WHERE blog_id = ?', [blogId]);
    const sid=req.session.alumni_id;
    const [nameinfo]=await db.query('SELECT * FROM student WHERE id=?',[sid]);

    // Render view
    res.render('singleBlog', { blog, comments ,nameinfo: nameinfo[0] });

  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});


app.get('/blogs/:id', async (req, res) => {
  const blogId = req.params.id;
  console.log(blogId);

  try {
    // Fetch blog with alumni name
    const [blogData] = await db.query(`
      SELECT blogs.*, alumni.name AS author_name 
      FROM blogs 
      JOIN alumni ON blogs.alumni_id = alumni.id 
      WHERE blogs.id = ?
    `, [blogId]);

    if (blogData.length === 0) {
      return res.status(404).render('error', { message: 'Blog not found' });
    }

    // Format date and time
    const blog = blogData[0];
    const dateObj = new Date(blog.uploaded_date);
    blog.formatted_date = dateObj.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    blog.formatted_time = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    // Fetch comments
    const [comments] = await db.query('SELECT * FROM comments WHERE blog_id = ?', [blogId]);
    const sid=req.session.alumni_id;
    const [nameinfo]=await db.query('SELECT * FROM alumni WHERE id=?',[sid]);

    // Render view
    console.log(nameinfo[0]);
    res.render('singleBlogAl', { blog, comments ,nameinfo: nameinfo[0] });

  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});

app.get('/student-blog/:id', async (req, res) => {
  const blogId = req.params.id;
  console.log(blogId);

  try {
    // Fetch blog with author name
    const [blogData] = await db.query(`
      SELECT sb.*, s.name AS author_name
      FROM studentblog sb
      JOIN student s ON sb.student_id = s.id
      WHERE sb.id = ?
    `, [blogId]);

    if (blogData.length === 0) {
      return res.status(404).render('error', { message: 'Blog not found' });
    }

    const blog = blogData[0];

    // Format date and time
    const dateObj = new Date(blog.uploaded_date);
    blog.formatted_date = dateObj.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    blog.formatted_time = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    // Fetch comments for this blog
    const [comments] = await db.query(`
      SELECT id, blog_id, commenter_name, comment_text, commented_at, asid
      FROM studentcomments
      WHERE blog_id = ?
      ORDER BY commented_at DESC
    `, [blogId]);

    // Fetch current student's name info, if logged in
    let nameinfo = null;
    if (req.session.alumni_id) {
      const [studentRows] = await db.query('SELECT * FROM student WHERE id = ?', [req.session.alumni_id]);
      nameinfo = studentRows.length ? studentRows[0] : null;
    }

    // Render view
    res.render('singleBlogstudent', { blog, comments, nameinfo });

  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});

app.get('/student-blogs/:id', async (req, res) => {
  const blogId = req.params.id;
  console.log(blogId);

  try {
    // Fetch blog with author name
    const [blogData] = await db.query(`
      SELECT sb.*, s.name AS author_name
      FROM studentblog sb
      JOIN student s ON sb.student_id = s.id
      WHERE sb.id = ?
    `, [blogId]);

    if (blogData.length === 0) {
      return res.status(404).render('error', { message: 'Blog not found' });
    }

    const blog = blogData[0];

    // Format date and time
    const dateObj = new Date(blog.uploaded_date);
    blog.formatted_date = dateObj.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    blog.formatted_time = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    // Fetch comments for this blog
    const [comments] = await db.query(`
      SELECT id, blog_id, commenter_name, comment_text, commented_at, asid
      FROM studentcomments
      WHERE blog_id = ?
      ORDER BY commented_at DESC
    `, [blogId]);

    // Fetch current student's name info, if logged in

    const sid=req.session.alumni_id;
    const [nameinfo]=await db.query('SELECT * FROM alumni WHERE id=?',[sid]);

    // Render view
    console.log(nameinfo[0]);

    // Render view
    res.render('singleStudentBlogAl', { blog, comments ,nameinfo: nameinfo[0] });

  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});




app.post('/submit-comment', async (req, res) => {
  const { blog_id, commenter_name, comment_text, alumni_id } = req.body;

  if (!blog_id || !comment_text || !commenter_name || !alumni_id) {
    return res.status(400).render('error', { message: 'All fields are required.' });
  }

  try {
    await db.query(
      'INSERT INTO comments (blog_id, commenter_name, comment_text, asid) VALUES (?, ?, ?, ?)',
      [blog_id, commenter_name, comment_text, alumni_id]
    );

    res.redirect(`/blog/${blog_id}`);
  } catch (err) {
    console.error('Comment insert error:', err);
    res.status(500).render('error', { message: 'Failed to post comment.' });
  }
});



app.post('/submit-comment1', async (req, res) => {
  const { blog_id, commenter_name, comment_text, alumni_id } = req.body;

  if (!blog_id || !comment_text || !commenter_name || !alumni_id) {
    return res.status(400).render('error', { message: 'All fields are required.' });
  }

  try {
    await db.query(
      'INSERT INTO comments (blog_id, commenter_name, comment_text, asid) VALUES (?, ?, ?, ?)',
      [blog_id, commenter_name, comment_text, alumni_id]
    );

    res.redirect(`/blogs/${blog_id}`);
  } catch (err) {
    console.error('Comment insert error:', err);
    res.status(500).render('error', { message: 'Failed to post comment.' });
  }
});


app.post('/submit-comment-studentblog', async (req, res) => {
  const { blog_id, commenter_name, comment_text, alumni_id } = req.body;

  if (!blog_id || !comment_text || !commenter_name || !alumni_id) {
    return res.status(400).render('error', { message: 'All fields are required.' });
  }

  try {
    await db.query(
      'INSERT INTO studentcomments (blog_id, commenter_name, comment_text, asid) VALUES (?, ?, ?, ?)',
      [blog_id, commenter_name, comment_text, alumni_id]
    );

    res.redirect(`/student-blog/${blog_id}`);
  } catch (err) {
    console.error('Comment insert error:', err);
    res.status(500).render('error', { message: 'Failed to post comment.' });
  }
});


app.post('/submit-comment-studentblog1', async (req, res) => {
  const { blog_id, commenter_name, comment_text, alumni_id } = req.body;

  if (!blog_id || !comment_text || !commenter_name || !alumni_id) {
    return res.status(400).render('error', { message: 'All fields are required.' });
  }

  try {
    await db.query(
      'INSERT INTO studentcomments (blog_id, commenter_name, comment_text, asid) VALUES (?, ?, ?, ?)',
      [blog_id, commenter_name, comment_text, alumni_id]
    );

    res.redirect(`/student-blogs/${blog_id}`);
  } catch (err) {
    console.error('Comment insert error:', err);
    res.status(500).render('error', { message: 'Failed to post comment.' });
  }
});




app.post('/api/ask-ai', async (req, res) => {
  try {
    const { question } = req.body;
    
    const completion = await groq.chat.completions.create({
      messages: [{
        role: "system",
        content: "You are an expert education advisor. Provide detailed, accurate answers about all education levels (primary to higher education). Include relevant resources when possible."
      }, {
        role: "user",
        content: question
      }],
      model: "mixtral-8x7b-32768"
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

// Ask AI endpoint
app.post('/mentorship/ask-ai', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: "Question is required" });
    }
    
    // First try to find relevant blogs
    const [relevantBlogs] = await db.query(
      `SELECT b.*, a.name, a.graduation_year, a.occupation
        FROM Blogs b
        JOIN Alumni a ON b.alumni_id = a.id
        WHERE MATCH(b.title, b.description) AGAINST (? IN NATURAL LANGUAGE MODE)
        LIMIT 3`,
      [question]
    );
    
    let aiResponse;
    let sources = [];
    
    if (relevantBlogs.length > 0) {
      // Get answer based on existing blogs
      aiResponse = await getAIResponse(question, relevantBlogs);
      sources = relevantBlogs.map(blog => ({
        title: blog.title,
        author: blog.name,
        grad_year: blog.graduation_year,
        occupation: blog.occupation,
        id: blog.id
      }));
    } else {
      // No relevant blogs - search internet
      try {
        const webResults = await searchInternet(question + " rural education opportunities site:.gov OR site:.edu");
        aiResponse = await getAIResponse(
          `${question} - Please include recent opportunities and resources for rural education.`,
          webResults
        );
        sources = webResults.map(result => ({
          title: result.title,
          url: result.link,
          type: 'web'
        }));
      } catch (searchErr) {
        console.error('Internet search failed:', searchErr);
        // Fallback to basic response if search fails
        aiResponse = await getAIResponse(question, []);
        sources = [{ type: 'ai_knowledge', note: 'Generated from AI knowledge base' }];
      }
    }
    
    // Format response with markdown support
    const formattedResponse = aiResponse
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    res.json({
      answer: `<p>${formattedResponse}</p>`,
      sources: sources,
      sourceType: relevantBlogs.length > 0 ? 'alumni_experiences' : 'web_research'
    });
    
  } catch (err) {
    console.error("AI question error:", err);
    res.status(500).json({ 
      error: "Failed to process question",
      details: process.env.NODE_ENV === 'development' ? err.message : "Server error" 
    });
  }
});

  
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Something broke!' });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});