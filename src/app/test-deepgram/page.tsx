"use client";

import { useDeepgramAgent } from "../../hooks/useDeepgramAgent";
import { useState } from "react";

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
    startListening,
    stopListening,
    connect,
    clearConversation
  } = useDeepgramAgent();

  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Enhanced diagnostics
  const runDiagnostics = async () => {
    addLog("🔍 Starting Deepgram Voice Agent Diagnostics...");
    
    // Test 1: Browser compatibility
    addLog(`🌐 Browser: ${navigator.userAgent}`);
    addLog(`🔊 Web Audio API: ${typeof AudioContext !== 'undefined' ? 'Supported' : 'Not Supported'}`);
    addLog(`🎤 MediaDevices: ${navigator.mediaDevices ? 'Supported' : 'Not Supported'}`);
    
    // Test 2: Audio context
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      addLog(`🎵 Audio Context Sample Rate: ${audioContext.sampleRate}Hz`);
      addLog(`🎵 Audio Context State: ${audioContext.state}`);
      audioContext.close();
    } catch (err) {
      addLog(`❌ Audio Context Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    // Test 3: Microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = stream.getAudioTracks()[0];
      const settings = track.getSettings();
      addLog(`🎤 Microphone Sample Rate: ${settings.sampleRate || 'Unknown'}Hz`);
      addLog(`🎤 Microphone Channels: ${settings.channelCount || 'Unknown'}`);
      addLog(`🎤 Microphone Device: ${track.label || 'Unknown'}`);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      addLog(`❌ Microphone Access Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    // Test 4: API key
    try {
      const response = await fetch('/api/deepgram/token');
      if (response.ok) {
        const data = await response.json();
        addLog(`🔑 API Key: ${data.token ? 'Present' : 'Missing'}`);
      } else {
        addLog(`❌ API Key Error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      addLog(`❌ API Key Fetch Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    addLog("✅ Diagnostics complete!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Deepgram Voice Agent Test & Diagnostics
        </h1>
        
        {/* Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
          
          <div className={`p-4 rounded-lg text-center ${isProcessing ? 'bg-purple-500/20 border border-purple-400' : 'bg-gray-500/20 border border-gray-400'}`}>
            <div className="text-sm text-gray-300 mb-1">Processing</div>
            <div className={`text-lg font-bold ${isProcessing ? 'text-purple-400' : 'text-gray-400'}`}>
              {isProcessing ? '🤔' : '○'}
            </div>
          </div>

          <div className={`p-4 rounded-lg text-center ${isSpeaking ? 'bg-orange-500/20 border border-orange-400' : 'bg-gray-500/20 border border-gray-400'}`}>
            <div className="text-sm text-gray-300 mb-1">Speaking</div>
            <div className={`text-lg font-bold ${isSpeaking ? 'text-orange-400' : 'text-gray-400'}`}>
              {isSpeaking ? '🔊' : '○'}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={connect}
            disabled={isConnected || isConnecting}
            className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ${
              isConnected || isConnecting
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Connect to Deepgram'}
          </button>
          
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={!isConnected}
            className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ${
              !isConnected
                ? 'bg-gray-500 text-white cursor-not-allowed'
                : isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {!isConnected ? 'Connect First' : isListening ? 'Stop Listening' : 'Start Listening'}
          </button>

          <button
            onClick={runDiagnostics}
            className="px-6 py-3 rounded-lg text-lg font-semibold bg-purple-500 hover:bg-purple-600 text-white transition-all duration-300"
          >
            Run Diagnostics
          </button>
        </div>

        {/* Logs Toggle */}
        <div className="text-center mb-4">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </button>
        </div>

        {/* Logs Display */}
        {showLogs && (
          <div className="bg-black/50 border border-gray-600 rounded-lg p-4 mb-6 max-h-64 overflow-y-auto">
            <div className="text-green-400 font-semibold mb-2">Diagnostic Logs:</div>
            <div className="text-gray-300 text-sm font-mono space-y-1">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              {logs.length === 0 && <div>No logs yet. Click "Run Diagnostics" to start.</div>}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 mb-6">
            <div className="text-red-400 font-semibold mb-2">Error:</div>
            <div className="text-red-300 font-mono text-sm">{error}</div>
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
            <li>• Click "Run Diagnostics" to check your system compatibility</li>
            <li>• Click "Connect to Deepgram" to establish connection</li>
            <li>• Click "Start Listening" to activate microphone</li>
            <li>• Speak clearly into your microphone</li>
            <li>• The AI will respond with voice and text</li>
            <li>• Check browser console for detailed logs</li>
          </ul>
        </div>

        {/* Troubleshooting Tips */}
        <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-400 rounded-lg">
          <h3 className="text-yellow-400 font-semibold mb-2">Troubleshooting Robot Voice:</h3>
          <ul className="text-yellow-300 text-sm space-y-1">
            <li>• Ensure consistent 16kHz sample rate for input/output</li>
            <li>• Check browser console for audio processing errors</li>
            <li>• Verify microphone permissions are granted</li>
            <li>• Try refreshing the page if audio context is suspended</li>
            <li>• Use Chrome/Edge for best compatibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 