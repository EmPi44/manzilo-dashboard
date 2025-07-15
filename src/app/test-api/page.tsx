"use client";

import { useState } from 'react';

export default function TestAPIPage() {
  const [tokenResult, setTokenResult] = useState('');
  const [chatResult, setChatResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testTokenAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/deepgram/token');
      const data = await response.json();
      setTokenResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setTokenResult(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testChatAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/deepgram/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Hello, how are you?' }),
      });
      const data = await response.json();
      setChatResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setChatResult(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          API Endpoint Tests
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Token API Test */}
          <div className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Token API Test</h2>
            <button
              onClick={testTokenAPI}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Token API'}
            </button>
            {tokenResult && (
              <div className="mt-4">
                <h3 className="text-white font-semibold mb-2">Result:</h3>
                <pre className="bg-black/50 text-green-400 p-4 rounded-lg text-sm overflow-auto max-h-40">
                  {tokenResult}
                </pre>
              </div>
            )}
          </div>

          {/* Chat API Test */}
          <div className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Chat API Test</h2>
            <button
              onClick={testChatAPI}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Chat API'}
            </button>
            {chatResult && (
              <div className="mt-4">
                <h3 className="text-white font-semibold mb-2">Result:</h3>
                <pre className="bg-black/50 text-green-400 p-4 rounded-lg text-sm overflow-auto max-h-40">
                  {chatResult}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-500/20 rounded-lg">
          <h3 className="text-yellow-400 font-semibold mb-2">Instructions:</h3>
          <ul className="text-yellow-300 text-sm space-y-1">
            <li>• Click "Test Token API" to verify Deepgram authentication</li>
            <li>• Click "Test Chat API" to verify OpenAI integration</li>
            <li>• Both should return JSON responses without errors</li>
            <li>• If either fails, check environment variables and API keys</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 