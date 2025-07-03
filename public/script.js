// script.js - Frontend logic for Hybrid AI Chatbot (cloud-only)
// This script handles the chat UI and backend API calls. Brain.js (offline) logic has been removed.

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

// Handle chat form submit
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  addMessage('user', message);
  userInput.value = '';

  // Only use backend (cloud LLM)
  addMessage('bot', 'Thinking...');
  try {
    const res = await fetch('/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
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
