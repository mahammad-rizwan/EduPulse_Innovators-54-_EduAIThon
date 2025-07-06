const express = require('express');
const router = express.Router();
const db = require('./src/config/dbConnect');

router.get('/blogs', async (req, res) => {
  try {
    const studentId = req.session.alumni_id;

    if (!studentId) {
      return res.status(401).json({ error: 'Student not logged in' });
    }

    // Step 1: Get school_id of logged-in student
    const [[studentRow]] = await db.query(
      'SELECT school_id FROM student WHERE id = ?',
      [studentId]
    );
    if (!studentRow) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const schoolId = studentRow.school_id;

    // Step 2: Get blogs with alumni name (instead of just alumni_id)
    const [rows] = await db.query(`
      SELECT b.title, b.description, a.name AS alumni_name
      FROM blogs b
      JOIN alumni a ON b.alumni_id = a.id
      WHERE a.school_id = ?
    `, [schoolId]);

    // Step 3: Format blogPrompt with alumni name
    const blogPrompt = rows.map((blog, i) =>
      `Blog ${i + 1}:\nTitle: ${blog.title}\nDescription: ${blog.description}\nPosted by: ${blog.alumni_name}`
    ).join('\n\n');

    // Step 4: Send JSON prompt
    res.json({
      prompt: `You are an educational assistant chatbot created for Indian students. Your responses should be accurate, student-friendly, and based primarily on alumni-provided blog content.

🔹 If the user's question matches any content in the alumni blogs, respond by referring to it naturally. Mention the alumni's name or the blog title only where appropriate. Avoid saying the word "blog" repeatedly.

🔹 If the question is **related to education** but **not covered** in the blogs, use your own knowledge to give a general, helpful, and informative response. Don't say things like "the blogs do not contain..." — just answer directly.

🔹 If the question is completely unrelated to education, politely let the user know that you're designed to assist only with educational topics.

Always ensure the answer is clear, relevant, and easy for students to understand.

Below is the alumni-provided blog content:
${blogPrompt}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

module.exports = router;
