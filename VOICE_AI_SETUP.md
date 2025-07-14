# Voice AI Setup Guide

## 🚀 Quick Setup

### 1. Environment Configuration

Create a `.env.local` file in the root directory with your OpenAI API key:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Configure other settings
NEXT_PUBLIC_APP_NAME=Manzilo Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the key and paste it in your `.env.local` file

### 3. Start the Development Server

```bash
npm run dev
```

## 🎯 How It Works

### Voice AI Flow:
1. **Click the bubble** → Activates microphone
2. **Speak your question** → Real-time speech recognition
3. **AI processes** → Sends to OpenAI GPT-4
4. **AI responds** → Text-to-speech playback

### Features:
- ✅ Real-time speech recognition
- ✅ OpenAI GPT-4 integration
- ✅ Text-to-speech response
- ✅ Visual feedback states
- ✅ Error handling
- ✅ Conversation display

## 🛠 Technical Details

### Components:
- **`useVoiceAI.js`** - Custom hook for voice functionality
- **`AIBubble.js`** - Main UI component
- **`/api/chat`** - OpenAI API integration

### Browser Support:
- Chrome/Edge: Full support
- Firefox: Limited support
- Safari: Limited support
- Mobile browsers: Varies

## 🔧 Troubleshooting

### Common Issues:

1. **"Speech recognition not supported"**
   - Use Chrome or Edge browser
   - Ensure HTTPS connection (required for microphone)

2. **"OpenAI API key not configured"**
   - Check your `.env.local` file
   - Restart the development server

3. **Microphone not working**
   - Check browser permissions
   - Ensure HTTPS connection
   - Try refreshing the page

4. **No response from AI**
   - Check OpenAI API key validity
   - Check network connection
   - Check browser console for errors

## 🎨 Customization

### Modify AI Context:
Edit the context in `useVoiceAI.js`:
```javascript
context: 'You are a helpful AI assistant for a property management dashboard...'
```

### Change Visual Style:
Modify colors and animations in `AIBubble.js`

### Adjust API Settings:
Modify model, temperature, and tokens in `/api/chat/route.js`

## 🔒 Security Notes

- Never commit your `.env.local` file to version control
- API keys are server-side only (secure)
- Consider rate limiting for production use
- Monitor API usage and costs

## 📱 Mobile Support

The voice AI works on mobile devices with:
- Chrome/Edge mobile browsers
- Microphone permissions granted
- Stable internet connection

## 🚀 Next Steps

Future enhancements:
- [ ] Conversation history
- [ ] Dashboard context integration
- [ ] Advanced error handling
- [ ] Performance optimization
- [ ] Accessibility improvements 