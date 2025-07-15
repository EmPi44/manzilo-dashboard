"use client";

import { useDeepgramAgent } from "../../hooks/useDeepgramAgent";

export default function TestDeepgramPage() {
  const {
    isConnected,
    isConnecting,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    response,
    error,
    toggleListening,
    clearConversation
  } = useDeepgramAgent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Deepgram Voice Agent Test
        </h1>
        
        {/* Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg text-center ${isConnected ? 'bg-green-500/20 border border-green-400' : 'bg-gray-500/20 border border-gray-400'}`}>
            <div className="text-sm text-gray-300 mb-1">Connected</div>
            <div className={`text-lg font-bold ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
              {isConnected ? '✓' : '✗'}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg text-center ${isConnecting ? 'bg-yellow-500/20 border border-yellow-400' : 'bg-gray-500/20 border border-gray-400'}`}>
            <div className="text-sm text-gray-300 mb-1">Connecting</div>
            <div className={`text-lg font-bold ${isConnecting ? 'text-yellow-400' : 'text-gray-400'}`}>
              {isConnecting ? '⟳' : '○'}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg text-center ${isListening ? 'bg-blue-500/20 border border-blue-400' : 'bg-gray-500/20 border border-gray-400'}`}>
            <div className="text-sm text-gray-300 mb-1">Listening</div>
            <div className={`text-lg font-bold ${isListening ? 'text-blue-400' : 'text-gray-400'}`}>
              {isListening ? '🎤' : '○'}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg text-center ${isSpeaking ? 'bg-purple-500/20 border border-purple-400' : 'bg-gray-500/20 border border-gray-400'}`}>
            <div className="text-sm text-gray-300 mb-1">Speaking</div>
            <div className={`text-lg font-bold ${isSpeaking ? 'text-purple-400' : 'text-gray-400'}`}>
              {isSpeaking ? '🔊' : '○'}
            </div>
          </div>
        </div>

        {/* Main Control */}
        <div className="text-center mb-8">
          <button
            onClick={toggleListening}
            disabled={isConnecting}
            className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 ${
              isConnecting
                ? 'bg-yellow-500 text-white cursor-not-allowed'
                : isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isConnecting ? 'Connecting...' : isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 mb-6">
            <div className="text-red-400 font-semibold mb-2">Error:</div>
            <div className="text-red-300">{error}</div>
          </div>
        )}

        {/* Conversation Display */}
        <div className="space-y-4">
          {transcript && (
            <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-4">
              <div className="text-blue-400 font-semibold mb-2">You said:</div>
              <div className="text-blue-300">{transcript}</div>
            </div>
          )}
          
          {response && (
            <div className="bg-green-500/20 border border-green-400 rounded-lg p-4">
              <div className="text-green-400 font-semibold mb-2">AI Response:</div>
              <div className="text-green-300">{response}</div>
            </div>
          )}
        </div>

        {/* Clear Button */}
        {(transcript || response) && (
          <div className="text-center mt-6">
            <button
              onClick={clearConversation}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Clear Conversation
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-500/20 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Instructions:</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Click "Start Listening" to connect to Deepgram Voice Agent</li>
            <li>• Speak clearly into your microphone</li>
            <li>• The AI will respond with voice and text</li>
            <li>• Click "Stop Listening" to end the session</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 