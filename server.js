/**
 * server.js - Backend Server for Cloud-Only AI Chatbot
 * 
 * This server provides a REST API for the chatbot frontend, handling communication
 * with OpenRouter AI service for LLM responses.
 * 
 * Features:
 * - OpenRouter AI service integration
 * - Short-term memory for conversational context
 * - Bot name detection and personalization
 * - Error handling and quota management
 * - Static file serving for the frontend
 * 
 * @author Your Name
 * @version 2.0.0
 * @since 2024
 */

// ============================================================================
// DEPENDENCIES AND CONFIGURATION
// ============================================================================

require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Web framework for Node.js
const cors = require('cors'); // Cross-Origin Resource Sharing middleware
const path = require('path'); // Path utilities for file operations
const axios = require('axios'); // HTTP client for API requests

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000; // Use environment PORT or default to 3000

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

app.use(cors()); // Enable CORS for cross-origin requests (important for development)
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory

// ============================================================================
// DEBUGGING AND LOGGING
// ============================================================================

// Log API key status (showing first 4 and last 4 characters for security)
console.log('OpenRouter API Key:', process.env.OPENROUTER_API_KEY ? 
  process.env.OPENROUTER_API_KEY.slice(0, 4) + '...' + process.env.OPENROUTER_API_KEY.slice(-4) : 'NOT SET');

// Verify API key format
if (process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.startsWith('sk-or-v1-')) {
  console.warn('⚠️  Warning: OpenRouter API key format may be incorrect. Should start with "sk-or-v1-"');
}

// ============================================================================
// MEMORY AND STATE MANAGEMENT
// ============================================================================

// In-memory chat history for short-term memory (persists during server session)
const chatHistory = [];
const MAX_HISTORY = 5; // Maximum number of conversation exchanges to remember
let botName = 'Assistant'; // Default bot name, can be changed by user

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detects if the user is giving a name to the bot in their message
 * 
 * This function uses regex patterns to identify when a user wants to
 * personalize the bot by giving it a specific name. The patterns cover
 * common ways users might express this intention.
 * 
 * @param {string} userMessage - The user's input message
 * @returns {string|null} - The detected name or null if no name found
 * 
 * @example
 * detectBotName("I would like to call you Alice") // Returns "Alice"
 * detectBotName("Your name is Bob") // Returns "Bob"
 * detectBotName("Hello there") // Returns null
 */
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



// ============================================================================
// AI SERVICE INTEGRATION - OPENROUTER (PRIMARY)
// ============================================================================

/**
 * Sends a message to the OpenRouter AI API with enhanced features
 * 
 * OpenRouter serves as the primary AI service and includes additional
 * features like conversation memory and bot name personalization.
 * 
 * @param {string} userMessage - The user's input message
 * @returns {Promise<string|null>} - AI response or null on error
 * 
 * @throws {Error} - Network errors, API errors, timeout errors
 */
async function askOpenRouter(userMessage) {
  // Check if user is giving a name to the bot
  const newName = detectBotName(userMessage);
  if (newName) botName = newName; // Update bot name if detected

  // OpenRouter API configuration
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  // Build comprehensive message history for context
  const messages = [
    // Enhanced system prompt with bot name and personality
    { 
      role: 'system', 
      content: `You are a helpful, friendly AI assistant. The user has named you ${botName}. Respond as ${botName} in a natural, conversational, and engaging way, as if you were a human chatting with a friend. Use clear language, show empathy, and keep your answers concise and approachable.` 
    },
    ...chatHistory, // Include conversation history for context
    { role: 'user', content: userMessage } // Current user message
  ];
  
  const payload = {
    model: 'anthropic/claude-3-haiku', // Claude 3 Haiku model via OpenRouter
    messages
  };
  
  try {
    // Make API request
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    
    const reply = response.data.choices?.[0]?.message?.content?.trim();
    
    // Update conversation history for future context
    chatHistory.push({ role: 'user', content: userMessage });
    chatHistory.push({ role: 'assistant', content: reply });
    
    // Maintain history size limit (remove oldest messages if exceeded)
    while (chatHistory.length > MAX_HISTORY * 2) {
      chatHistory.shift(); // Remove oldest message pair
    }
    
    return reply;
    
  } catch (err) {
    console.log('OpenRouter API error occurred:');
    console.log('Error status:', err.response?.status);
    console.log('Error data:', err.response?.data);
    console.log('Error message:', err.message);
    
    // Handle quota exceeded errors
    if (err.response?.status === 429) {
      console.log('Handling 429 quota exceeded error');
      return '__QUOTA_EXCEEDED__';
    }
    
    // Handle insufficient balance/credits errors
    if (err.response?.data?.error?.message?.toLowerCase().includes('balance') ||
        err.response?.data?.error?.message?.toLowerCase().includes('credit') ||
        err.response?.data?.error?.message?.toLowerCase().includes('insufficient')) {
      console.log('OpenRouter API: Balance/credit error - service unavailable');
      return '__QUOTA_EXCEEDED__';
    }
    
    // Handle 404 model not found errors
    if (err.response?.status === 404) {
      console.log('OpenRouter API: Model not found (404) - check model name');
      return null;
    }
    
    // Log other errors
    console.error('OpenRouter API error:', err.response?.data || err.message);
    return null;
  }
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /message - Main chat endpoint
 * 
 * Handles incoming chat messages from the frontend, processes them through
 * the OpenRouter AI service, and returns the response.
 * 
 * Request body: { message: string }
 * Response: { reply: string } or { error: string }
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

/**
 * Start the Express server
 * 
 * The server will listen on the specified port and log the URL
 * where the application can be accessed.
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`🧠 AI Service: OpenRouter`);
});

// ============================================================================
// NOTES FOR FUTURE ENHANCEMENTS
// ============================================================================

/*
 * Potential improvements and additional features:
 * 
 * 1. Database Integration:
 *    - Store chat history persistently
 *    - User authentication and session management
 *    - Conversation analytics
 * 
 * 2. Additional AI Services:
 *    - Add more fallback options (Anthropic Claude, Google Gemini, etc.)
 *    - Service health monitoring and automatic failover
 *    - Load balancing between multiple services
 * 
 * 3. Enhanced Features:
 *    - File upload and processing
 *    - Voice input/output
 *    - Multi-language support
 *    - Conversation export
 * 
 * 4. Security Enhancements:
 *    - Rate limiting per user/IP
 *    - Input sanitization and validation
 *    - API key rotation
 *    - Request logging and monitoring
 * 
 * 5. Performance Optimizations:
 *    - Response caching
 *    - Connection pooling
 *    - Compression middleware
 *    - CDN integration
 */
