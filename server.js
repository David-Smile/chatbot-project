// server.js - Backend for AI Chatbot with OpenRouter

// Dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Log API key status
console.log('OpenRouter API Key:', process.env.OPENROUTER_API_KEY ? 
  process.env.OPENROUTER_API_KEY.slice(0, 4) + '...' + process.env.OPENROUTER_API_KEY.slice(-4) : 'NOT SET');

// Verify API key format
if (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith('sk-or-v1-')) {
  console.warn('⚠️  Warning: OpenRouter API key format may be incorrect. Should start with "sk-or-v1-"');
}

// Chat memory
const chatHistory = [];
const MAX_HISTORY = 5;
let botName = 'Assistant';

// Detect bot name from user message
function detectBotName(userMessage) {
  // Regex patterns to match common name-giving phrases
  const namePatterns = [
    /call you ([A-Za-z0-9_\- ]{2,30})/i,      // "I want to call you X"
    /your name is ([A-Za-z0-9_\- ]{2,30})/i,  // "Your name is X"
    /I'll call you ([A-Za-z0-9_\- ]{2,30})/i, // "I'll call you X"
    /I want to call you ([A-Za-z0-9_\- ]{2,30})/i // "I want to call you X"
  ];
  
  // Check each pattern against the user message
  for (const pattern of namePatterns) {
    const match = userMessage.match(pattern);
    if (match) {
      return match[1].trim(); // Return the captured name
    }
  }
  return null; // No name detected
}



// OpenRouter AI service
async function askOpenRouter(userMessage) {
  // Check if user is giving a name to the bot
  const newName = detectBotName(userMessage);
  if (newName) botName = newName; // Update bot name if detected

  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  const messages = [
    { 
      role: 'system', 
      content: `You are a helpful, friendly AI assistant. The user has named you ${botName}. Respond as ${botName} in a natural, conversational, and engaging way, as if you were a human chatting with a friend. Use clear language, show empathy, and keep your answers concise and approachable.` 
    },
    ...chatHistory,
    { role: 'user', content: userMessage }
  ];
  
  const payload = {
    model: 'anthropic/claude-3-haiku',
    messages
  };
  
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const reply = response.data.choices?.[0]?.message?.content?.trim();
    
    // Update chat history
    chatHistory.push({ role: 'user', content: userMessage });
    chatHistory.push({ role: 'assistant', content: reply });
    
    // Keep history size limited
    while (chatHistory.length > MAX_HISTORY * 2) {
      chatHistory.shift();
    }
    
    return reply;
    
  } catch (err) {
    console.log('OpenRouter API error:', err.response?.data || err.message);
    
    if (err.response?.status === 429) {
      return '__QUOTA_EXCEEDED__';
    }
    
    if (err.response?.data?.error?.message?.toLowerCase().includes('balance') ||
        err.response?.data?.error?.message?.toLowerCase().includes('credit') ||
        err.response?.data?.error?.message?.toLowerCase().includes('insufficient')) {
      return '__QUOTA_EXCEEDED__';
    }
    
    if (err.response?.status === 404) {
      return null;
    }
    
    return null;
  }
}

// API endpoints
app.post('/message', async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    // Validate input
    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided.' });
    }
    
    console.log('Processing message:', userMessage.substring(0, 50) + '...');
    
    // Get response from OpenRouter AI service
    const reply = await askOpenRouter(userMessage);
    
    // Handle quota exceeded errors
    if (reply === '__QUOTA_EXCEEDED__') {
      console.log('Quota exceeded - returning 429');
      return res.status(429).json({ 
        error: 'AI service quota exceeded. Please try again later or check your plan.' 
      });
    }
    
    // Handle service failures
    if (!reply) {
      console.log('AI service returned null - returning 500');
      return res.status(500).json({ 
        error: 'AI service failed. Please try again later.' 
      });
    }
    
    console.log('Successfully got reply from AI service');
    
    // Return successful response
    res.json({ reply });
    
  } catch (error) {
    console.error('Unexpected error in /message endpoint:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again later.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 OpenRouter API Key: ${process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing'}`);
});
