const Groq = require("groq-sdk");
const axios = require('axios');

// Create Groq client instance
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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"
});

/**
 * Get AI response based on user question and context
 * @param {string} question - The user's question
 * @param {Array} contextBlogs - Blog posts or search results for context
 * @returns {Promise<string>} - AI-generated response
 */
exports.getAIResponse = async (question, contextBlogs = []) => {
  try {
    // Prepare context from existing blogs or search results
    let context = '';
    
    if (contextBlogs.length > 0) {
      // Check if the context is from blogs or web search
      if (contextBlogs[0].hasOwnProperty('title') && contextBlogs[0].hasOwnProperty('description')) {
        // Context from blogs
        context = "Here are some relevant mentorship posts from our alumni:\n\n";
        contextBlogs.forEach(blog => {
          context += `- "${blog.title}" by ${blog.name} (${blog.graduation_year}, ${blog.occupation}):\n`;
          context += `  ${blog.description.substring(0, 250)}...\n\n`;
        });
      } else {
        // Context from web search
        context = "Here are some relevant web resources:\n\n";
        contextBlogs.forEach(result => {
          context += `- "${result.title}":\n`;
          context += `  ${result.snippet || ''}\n\n`;
        });
      }
    }

    // Prepare the system message with guidance for relevant responses
    const systemMessage = `You are a helpful mentorship assistant for rural education. 
    Your primary goal is to provide practical advice and resources for students in rural areas.
    
    ${context}
    
    When responding to questions:
    - Provide detailed, actionable advice that is relevant to rural education contexts
    - For career questions, include recent opportunities suitable for rural areas
    - Suggest practical resources that are accessible in remote locations
    - Include specific examples where appropriate
    - Format important points with markdown (bold for headings, bullet points for lists)
    - Keep your tone encouraging and supportive
    
    If you don't have specific information, acknowledge this and provide general guidance based on best practices.`;

    // Make API call to Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: question
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error("Groq API error:", error);
    return "Sorry, I encountered an error processing your question. Please try again later.";
  }
};

/**
 * Search the internet for relevant information
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Search results
 */
exports.searchInternet = async (query) => {
  try {
    // Check if API key is available
    if (!process.env.SERPAPI_KEY) {
      console.warn("SERPAPI_KEY not found in environment variables");
      // Return mock results when API key is not available
      return mockSearchResults(query);
    }

    // Make API call to SerpAPI
    const response = await axios.get(
      `https://api.serpapi.com/search`, {
        params: {
          q: query,
          api_key: process.env.SERPAPI_KEY
        },
        timeout: 5000 // 5 second timeout
      }
    );

    // Extract and return relevant search results
    return response.data.organic_results
      ? response.data.organic_results.slice(0, 5)
      : [];
  } catch (error) {
    console.error("Internet search error:", error);
    // Return mock results on error
    return mockSearchResults(query);
  }
};

/**
 * Get career opportunities relevant to rural education
 * @returns {Promise<string>} - Markdown-formatted career opportunities
 */
exports.getCareerOpportunities = async () => {
  try {
    const prompt = `Provide 5 recent career opportunities relevant to rural education graduates.
                   Include job titles, required qualifications, and general location information.
                   Format as a markdown list with bullet points.
                   Focus on remote-friendly positions and roles specific to rural areas.
                   Each opportunity should have: title, brief description, qualifications, and general salary range.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 1500
    });

    return completion.choices[0]?.message?.content || 
           "- Unable to retrieve career opportunities at this time.";
  } catch (error) {
    console.error("Career opportunities error:", error);
    return "- Unable to retrieve career opportunities at this time.";
  }
};

/**
 * Generate mock search results when real search is unavailable
 * @param {string} query - Search query
 * @returns {Array} - Mock search results
 */
function mockSearchResults(query) {
  return [
    {
      title: "Rural Education Resources - Department of Education",
      snippet: "Comprehensive resources for educators in rural communities including grants, professional development, and curriculum guidance.",
      link: "https://www.ed.gov/rural-education"
    },
    {
      title: "Mentorship Programs for Rural Students - Educational Research Journal",
      snippet: "Research on the effectiveness of mentorship programs in rural educational settings and best practices for implementation.",
      link: "https://www.example.edu/research/rural-mentorship"
    },
    {
      title: "Rural Opportunity Initiative - Career Development",
      snippet: "Programs designed to connect rural students with career opportunities and professional mentors in various fields.",
      link: "https://www.example.gov/rural-opportunities"
    }
  ];
}