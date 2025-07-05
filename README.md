# 🤖 AI Chatbot - Cloud-Powered Conversational Assistant

A modern, responsive AI chatbot built with Node.js, Express.js, and OpenRouter API. Features real-time chat interface, conversation memory, and intelligent responses powered by Claude 3 Haiku.

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-5.1.0-blue)
![OpenRouter](https://img.shields.io/badge/OpenRouter-API-orange)

## ✨ Features

### 🧠 AI-Powered Conversations
- **Claude 3 Haiku Integration** - Fast, reliable AI responses via OpenRouter
- **Conversation Memory** - Maintains context across multiple exchanges
- **Bot Personalization** - Users can give the bot a custom name
- **Intelligent Fallbacks** - Graceful error handling and retry mechanisms

### 🎨 Modern User Interface
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Real-time Chat** - Instant message delivery with typing animations
- **Dark Mode Support** - Toggle between light and dark themes
- **Message Formatting** - Automatic bullet points, paragraphs, and timestamps
- **Auto-resizing Input** - Dynamic textarea that grows with content

### ⚡ Performance & Reliability
- **Fast Response Times** - Optimized for quick AI interactions
- **Error Recovery** - Automatic retry on network failures
- **Loading States** - Visual feedback during AI processing
- **Offline Detection** - Clear error messages for connectivity issues

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 16.0.0 or higher)
- **npm** (version 8.0.0 or higher)
- **OpenRouter API Key** (free account at [openrouter.ai](https://openrouter.ai))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/David-Smile/chatbot-project.git
   cd chatbot-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file and add your OpenRouter API key
   echo "OPENROUTER_API_KEY=your_api_key_here" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required: Your OpenRouter API key
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# Optional: Server port (defaults to 3000)
PORT=3000

# Optional: Environment mode
NODE_ENV=development
```

### Getting Your OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)
6. Add it to your `.env` file

## 📁 Project Structure

```
chatbot-project/
├── server.js              # Main server file (Express.js backend)
├── package.json           # Project configuration and dependencies
├── .env                   # Environment variables (API keys)
├── .gitignore            # Git ignore rules
├── README.md             # Project documentation (this file)
└── public/               # Static frontend files
    ├── index.html        # Main HTML page
    ├── style.css         # Responsive CSS styling
    └── script.js         # Frontend JavaScript logic
```

## 🎯 Usage

### Basic Chat
1. Type your message in the input field
2. Press Enter or click "Send"
3. Wait for the AI response
4. Continue the conversation naturally

### Bot Personalization
Give your bot a custom name by saying:
- "I want to call you [Name]"
- "Your name is [Name]"
- "I'll call you [Name]"

### Keyboard Shortcuts
- **Enter** - Send message
- **Shift + Enter** - New line in input field

## 🛠️ Development

### Available Scripts

```bash
# Start development server with auto-restart
npm run dev

# Start production server
npm start

# Run in production mode
npm run prod

# Run tests (placeholder)
npm test

# Run linting (placeholder)
npm run lint
```

### Adding New Features

#### Changing AI Models
Edit the model in `server.js`:
```javascript
const payload = {
  model: 'anthropic/claude-3-haiku', // Change this line
  messages
};
```

Available models on OpenRouter:
- `anthropic/claude-3-haiku` (current - fast and reliable)
- `anthropic/claude-3-sonnet` (more capable)
- `openai/gpt-4o-mini` (GPT-4o Mini)
- `mistralai/mistral-7b-instruct` (Mistral 7B)

## 🔒 Security

### Best Practices
- ✅ **Never commit API keys** to version control
- ✅ **Use environment variables** for sensitive data
- ✅ **Validate user inputs** on both frontend and backend
- ✅ **Implement rate limiting** for production use
- ✅ **Monitor API usage** to prevent unexpected charges

## 🐛 Troubleshooting

### Common Issues

#### "API key not set"
- Check that your `.env` file exists
- Verify the API key format starts with `sk-or-v1-`
- Restart the server after adding the key

#### "AI service failed"
- Check your OpenRouter account balance
- Verify your API key is valid
- Check your internet connection
- Review server console for detailed error logs

#### "Network error"
- Ensure the server is running on the correct port
- Check firewall settings
- Verify the URL in your browser

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 📊 Performance

### Current Performance
- **Response Time:** ~1-3 seconds average
- **Memory Usage:** ~50MB for typical usage
- **Concurrent Users:** Supports multiple simultaneous chats
- **Uptime:** Depends on OpenRouter service availability

## 🤝 Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **OpenRouter** for providing access to multiple AI models
- **Anthropic** for Claude 3 Haiku model
- **Express.js** team for the excellent web framework
- **Node.js** community for the runtime environment

## 📞 Support

### Getting Help
- **Issues:** Create an issue on GitHub
- **Documentation:** Check this README and code comments

### Useful Links
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Express.js Guide](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**Made with ❤️ by David Chi**

*This project demonstrates modern web development practices and AI integration. Feel free to use it as a learning resource or starting point for your own projects!* 