// server.js - Backend for Hybrid AI Chatbot
// This server serves the frontend and provides endpoints for DeepSeek responses only.

require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // For HTTP requests to DeepSeek

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests (for development)
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// At the top, after loading dotenv
console.log('DeepSeek API Key:', process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.slice(0, 4) + '...' + process.env.DEEPSEEK_API_KEY.slice(-4) : 'NOT SET');
console.log('OpenRouter API Key:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.slice(0, 4) + '...' + process.env.OPENROUTER_API_KEY.slice(-4) : 'NOT SET');

// Helper: Call DeepSeek API (chat/completions)
async function askDeepSeek(userMessage) {
  // DeepSeek API endpoint and payload (OpenAI-compatible)
  const url = 'https://api.deepseek.com/v1/chat/completions';
  const payload = {
    model: 'deepseek-chat', // or 'deepseek-coder' for code tasks
    messages: [
      { role: 'system', content: 'You are a helpful chatbot.' },
      { role: 'user', content: userMessage }
    ]
  };
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds
    });
    // DeepSeek returns choices[0].message.content
    return response.data.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    // Improved error handling for quota/rate limit
    if (err.response?.status === 429) {
      return '__QUOTA_EXCEEDED__';
    }
    console.error('DeepSeek API error:', err.response?.data || err.message);
    return null;
  }
}

// Helper: Call OpenRouter API (OpenAI-compatible)
async function askOpenRouter(userMessage) {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const payload = {
    model: 'mistralai/mistral-7b-instruct', // Known available/free model on OpenRouter
    messages: [
      { role: 'system', content: 'You are a helpful chatbot.' },
      { role: 'user', content: userMessage }
    ]
  };
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds
    });
    return response.data.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    if (err.response?.status === 429) {
      return '__QUOTA_EXCEEDED__';
    }
    console.error('OpenRouter API error:', err.response?.data || err.message);
    return null;
  }
}

// POST /message - Handle chat messages and return AI response
app.post('/message', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'No message provided.' });
  }
  // Try DeepSeek first
  let reply = await askDeepSeek(userMessage);
  // If DeepSeek quota exceeded or fails, try OpenRouter
  if (!reply || reply === '__QUOTA_EXCEEDED__') {
    reply = await askOpenRouter(userMessage);
    if (reply === '__QUOTA_EXCEEDED__') {
      return res.status(429).json({ error: 'All AI services quota exceeded. Please try again later or check your plan.' });
    }
  }
  if (!reply) {
    return res.status(500).json({ error: 'All AI services failed. Please try again later.' });
  }
  res.json({ reply });
});

// ---
// Note: For other free/low-cost LLM APIs, you can add similar helper functions and endpoints.

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
