// script.js - Frontend logic for Hybrid AI Chatbot (cloud-only)
// This script handles the chat UI and backend API calls. Brain.js (offline) logic has been removed.

// DOM elements
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Helper: Format timestamp
function formatTime(date) {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

// Helper: Format bot text with paragraphs and lists
function formatBotText(text) {
  // Convert numbered lists (1. ... 2. ...) to <ol><li>...</li></ol>
  text = text.replace(/(\d+\. .+?)(?=(?:\n\d+\.|$))/gs, function(match) {
    const items = match.split(/\n(?=\d+\.)/).map(item => item.replace(/^\d+\.\s*/, ''));
    return '<ol>' + items.map(i => `<li>${i.trim()}</li>`).join('') + '</ol>';
  });
  // Convert double newlines to paragraphs
  text = text.replace(/\n\n+/g, '</p><p>');
  // Convert single newlines to <br>
  text = text.replace(/(?<!<\/p>)\n/g, '<br>');
  // Wrap in <p> if not already a list
  if (!/^<ol>/.test(text)) text = `<p>${text}</p>`;
  return text;
}

// Helper: Add message to chat log with timestamp
function addMessage(sender, text, timestamp = new Date()) {
  const msgDiv = document.createElement('div');
  msgDiv.className = sender;
  
  const timeStr = formatTime(timestamp);
  const senderName = sender === 'user' ? 'You' : 'Bot';
  
  msgDiv.innerHTML = `
    <div class="message-content">${sender === 'bot' ? formatBotText(text) : text}</div>
    <div class="message-time">${timeStr}</div>
  `;
  
  chatLog.appendChild(msgDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Helper: Add chat loading animation for bot
function addBotLoading() {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'bot loading';
  msgDiv.innerHTML = `
    <div class="message-content">
      <span class="dot-typing">
        <span></span><span></span><span></span>
      </span>
    </div>
    <div class="message-time">${formatTime(new Date())}</div>
  `;
  chatLog.appendChild(msgDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Helper: Add error message with retry option
function addErrorMessage(errorText, retryFunction) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'bot error';
  msgDiv.innerHTML = `
    <div class="message-content">
      <div class="error-text">${errorText}</div>
      ${retryFunction ? '<button class="retry-btn" onclick="this.parentElement.parentElement.parentElement.retryFunction()">Retry</button>' : ''}
    </div>
    <div class="message-time">${formatTime(new Date())}</div>
  `;
  
  if (retryFunction) {
    msgDiv.retryFunction = retryFunction;
  }
  
  chatLog.appendChild(msgDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Helper: Send message to backend
async function sendMessage(message, retryCount = 0) {
  try {
    const res = await fetch('/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await res.json();
    
    if (res.status === 429) {
      return {
        success: false,
        error: data.error || 'API quota exceeded. Please try again later.',
        retryable: true
      };
    } else if (res.ok) {
      return {
        success: true,
        reply: data.reply || 'Sorry, I could not understand.'
      };
    } else {
      return {
        success: false,
        error: data.error || 'Server error occurred.',
        retryable: retryCount < 2
      };
    }
  } catch (err) {
    return {
      success: false,
      error: 'Network error: Could not reach server.',
      retryable: retryCount < 2
    };
  }
}

// Handle chat form submit
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  
  // Disable form during processing
  const submitBtn = chatForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  
  addMessage('user', message);
  userInput.value = '';

  // Show loading animation
  addBotLoading();
  
  // Send message with retry logic
  let result = await sendMessage(message);
  let retryCount = 0;
  
  while (!result.success && result.retryable && retryCount < 2) {
    retryCount++;
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    result = await sendMessage(message, retryCount);
  }
  
  // Remove loading animation
  chatLog.lastChild.remove();
  
  if (result.success) {
    addMessage('bot', result.reply);
  } else {
    const retryFunction = result.retryable ? 
      () => handleRetry(message) : null;
    addErrorMessage(result.error, retryFunction);
  }
  
  // Re-enable form
  submitBtn.disabled = false;
  submitBtn.textContent = originalBtnText;
});

// Handle retry functionality
async function handleRetry(originalMessage) {
  // Remove the error message
  const errorMsg = document.querySelector('.bot.error');
  if (errorMsg) {
    errorMsg.remove();
  }
  
  // Show loading and retry
  addBotLoading();
  const result = await sendMessage(originalMessage, 1);
  
  // Remove loading animation
  chatLog.lastChild.remove();
  
  if (result.success) {
    addMessage('bot', result.reply);
  } else {
    addErrorMessage(result.error);
  }
}

// Auto-resize textarea
function autoResize() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

// Input event listeners
userInput.addEventListener('input', () => {
  autoResize();
});

// Add keyboard shortcuts
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});


// Add this at the end of DOMContentLoaded or initialization
function addIntroMessage() {
  const chatLog = document.getElementById('chat-log');
  const introMsg = document.createElement('div');
  introMsg.className = 'bot';
  introMsg.innerHTML = `<div class="message-content">👋 Hi! I'm your AI assistant. How can I help you today?</div><div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
  chatLog.appendChild(introMsg);
}

document.addEventListener('DOMContentLoaded', function() {
  addIntroMessage();
  // ... existing code ...
});
