// script.js - Frontend logic for Hybrid AI Chatbot
// This script handles the chat UI, Brain.js neural net, and backend API calls.

// Initialize Brain.js neural network
const net = new brain.NeuralNetwork();

// Expanded training data for Brain.js
// Best practice: use lowercase, simple phrasing, and cover common variations
const trainingData = [
  // Greetings
  { input: 'hello', output: 'Hi there! How can I help you?' },
  { input: 'hi', output: 'Hello! How can I assist you?' },
  { input: 'hey', output: 'Hey! What can I do for you?' },
  { input: 'good morning', output: 'Good morning! How can I help?' },
  { input: 'good afternoon', output: 'Good afternoon! How can I help?' },
  { input: 'good evening', output: 'Good evening! How can I help?' },

  // Farewells
  { input: 'bye', output: 'Goodbye!' },
  { input: 'see you', output: 'See you later!' },
  { input: 'good night', output: 'Good night! Take care.' },

  // Identity
  { input: 'who are you', output: 'I am a hybrid AI chatbot.' },
  { input: 'what is your name', output: 'I am your AI assistant.' },

  // Help
  { input: 'help', output: 'Sure! Ask me anything or type a question.' },
  { input: 'what can you do', output: 'I can answer questions and chat with you.' },

  // Gratitude
  { input: 'thank you', output: "You're welcome!" },
  { input: 'thanks', output: 'Glad to help!' },

  // Small talk
  { input: 'how are you', output: 'I am just a bot, but I am here to help!' },
  { input: 'what is the weather', output: "I can't check the weather, but I can answer other questions!" }
];

// Train the neural net with simple patterns
net.train(trainingData.map(item => ({ input: item.input, output: item.output })));

// DOM elements
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Helper: Add message to chat log
function addMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = sender;
  msgDiv.textContent = `${sender === 'user' ? 'You' : 'Bot'}: ${text}`;
  chatLog.appendChild(msgDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Helper: Decide if Brain.js can answer
function getBrainResponse(message) {
  // Run the neural net
  const output = net.run(message);
  // If output is a string and not empty, return it
  if (output && typeof output === 'string' && output.trim().length > 0) {
    return output;
  }
  return null;
}

// Handle chat form submit
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  addMessage('user', message);
  userInput.value = '';

  // Try Brain.js first (convert to lowercase for best match)
  let response = getBrainResponse(message.toLowerCase());
  if (response) {
    addMessage('bot', response);
    return;
  }

  // Fallback: Ask backend (Gemini)
  addMessage('bot', 'Thinking...');
  try {
    const res = await fetch('/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    // Remove 'Thinking...' and add real response
    chatLog.lastChild.remove();
    if (res.status === 429) {
      addMessage('bot', data.error || 'API quota exceeded. Please try again later.');
    } else {
      addMessage('bot', data.reply || 'Sorry, I could not understand.');
    }
  } catch (err) {
    chatLog.lastChild.remove();
    addMessage('bot', 'Error: Could not reach server.');
  }
});

// Initial greeting
addMessage('bot', 'Hello! Ask me anything.');
