const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');
const alumniController = require('../controllers/alumniController');
const schoolController = require('../controllers/schoolController');
const complaintController = require('../controllers/complaintController');


const blogController = require('../controllers/blogController');
const questionController = require('../controllers/questionController');
const replyController = require('../controllers/replyController');

// Student routes
router.post('/authority/create-student', studentController.createStudent);


// Alumni routes
router.post('/authority/create-alumni', alumniController.createAlumni);


// School routes
router.post('/ho/authority/create-student',async(req, res) => {
    console.log(req.body);
    const { id, password, name, address } = req.body;
  
   await db.query(
      "INSERT INTO School (id, password, name, address) VALUES (?, ?, ?, ?)",
      [id, password, name, address]
    )
    });

// Complaint routes
router.post('/submit-complaint', complaintController.createComplaint);
router.get('/complaints/:id', complaintController.getComplaintById);
router.get('/complaints/school/:school_id', complaintController.getComplaintsBySchoolId);


// Blog Routes
router.post('/blogs', blogController.createBlog);
router.get('/blogs/:id', blogController.getBlogById);
router.get('/blogs/alumni/:alumni_id', blogController.getBlogsByAlumniId);
router.get('/blogs/school/:school_id', blogController.getBlogsBySchoolId);

// Question Routes
router.post('/questions', questionController.createQuestion);
router.get('/questions/school/:school_id', questionController.getQuestionsBySchoolId);
router.get('/questions/status/:status', questionController.getQuestionsByStatus);

// Reply Routes
router.post('/replies', replyController.createReply);
router.get('/replies/question/:question_id', replyController.getRepliesByQuestionId);


module.exports = router;
