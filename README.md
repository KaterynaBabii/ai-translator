# AI Translator

A React-based translation application that uses Google's Gemini AI for translations and supports voice input/output.

## Features

- Text translation between multiple languages
- Voice input (speech-to-text)
- Voice output (text-to-speech)
- Modern, responsive UI with Tailwind CSS
- Integration with Google's Gemini AI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Gemini API key from Google AI Studio

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-translation
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Gemini API key:
```
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Environment Variables

- `REACT_APP_GEMINI_API_KEY`: Your Gemini API key from Google AI Studio

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Browser Support

The application uses the following Web APIs:
- Web Speech API for speech recognition
- SpeechSynthesis API for text-to-speech

Make sure your browser supports these APIs for full functionality.

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Google Gemini AI
- Web Speech API
- Hero Icons

## License

MIT 