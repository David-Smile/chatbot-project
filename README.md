# 🤖 Simple Cloud AI Chatbot

This is a simple AI-powered chatbot built with **Node.js** and **Express.js** that uses cloud-based large language models (LLMs) for intelligent responses.

### 🔧 Features
- 🚀 Cloud-only chatbot (no offline/local AI)
- 🌐 Uses DeepSeek and OpenRouter APIs for natural language responses
- 📡 Built with Express and deployed on the web

### 📚 Technologies Used
- JavaScript (Node.js)
- Express.js
- DeepSeek API (LLM)
- OpenRouter API (LLM fallback)
- HTML + CSS for frontend UI

---

### 🎯 Goal

To explore cloud-based chatbot design—leveraging modern LLM APIs for intelligent conversation, while learning core backend integration and API usage.

### 📦 How to Run Locally
1. Clone the repo
2. `npm install`
3. Create `.env` with your DeepSeek and OpenRouter API keys:
   ```
   DEEPSEEK_API_KEY=your-deepseek-api-key
   OPENROUTER_API_KEY=your-openrouter-api-key
   ```
4. `node server.js`  
5. Visit `http://localhost:3000` in your browser

---

### 📝 Notes
- All AI responses are generated via cloud APIs (no local neural network).
- If DeepSeek is unavailable or out of balance, OpenRouter is used as a fallback.
- You can easily add more LLM providers as needed.

---
