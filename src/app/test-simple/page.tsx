"use client";

import { useState, useEffect } from 'react';

export default function TestSimple() {
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState<string>('');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const getCloseCodeMeaning = (code: number): string => {
    switch (code) {
      case 1000: return 'Normal Closure';
      case 1001: return 'Going Away';
      case 1002: return 'Protocol Error';
      case 1003: return 'Unsupported Data';
      case 1005: return 'No Status Received';
      case 1006: return 'Abnormal Closure';
      case 1007: return 'Invalid frame payload data';
      case 1008: return 'Policy Violation';
      case 1009: return 'Message too big';
      case 1010: return 'Client terminating';
      case 1011: return 'Server terminating';
      case 1015: return 'TLS Handshake';
      default: return 'Unknown';
    }
  };

  // Step 1: Test token endpoint
  const testToken = async () => {
    setStatus('getting-token');
    addLog('Testing token endpoint...');
    
    try {
      const response = await fetch('/api/deepgram/token');
      addLog(`Token response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        addLog(`Token error: ${errorText}`);
        setStatus('token-error');
        return;
      }
      
      const data = await response.json();
      addLog(`Token received: ${data.token ? `${data.token.substring(0, 10)}...` : 'null'}`);
      setToken(data.token);
      setStatus('token-success');
    } catch (error) {
      addLog(`Token fetch error: ${error}`);
      setStatus('token-error');
    }
  };

  // Step 2: Test WebSocket connection
  const testWebSocket = async () => {
    if (!token) {
      addLog('No token available. Get token first.');
      return;
    }

    setStatus('connecting');
    addLog('Testing WebSocket connection...');
    
    try {
      const wsUrl = 'wss://api.deepgram.com/v1/listen';
      addLog(`Connecting to: ${wsUrl}`);
      addLog(`Using token: ${token.substring(0, 10)}...`);
      
      // Create WebSocket with proper subprotocols
      const ws = new WebSocket(wsUrl, ['token', token]);
      
      // Set a timeout for connection
      const connectionTimeout = setTimeout(() => {
        addLog('❌ Connection timeout after 10 seconds');
        ws.close();
      }, 10000);
      
      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        addLog('✅ WebSocket connected successfully!');
        setStatus('connected');
        
        // Send settings message with proper format
        const settings = {
          type: "Settings",
          audio: {
            input: {
              encoding: "linear16",
              sample_rate: 16000
            },
            output: {
              encoding: "linear16", 
              sample_rate: 24000
            }
          },
          agent: {
            listen: {
              provider: {
                model: "nova-3"
              }
            },
            think: {
              provider: {
                type: "open_ai",
                model: "gpt-4o-mini",
                url: "http://localhost:3000/api/deepgram/chat"
              }
            },
            speak: {
              provider: {
                model: "aura-2-en"
              }
            }
          }
        };
        
        addLog('Sending settings...');
        addLog(`Settings: ${JSON.stringify(settings, null, 2)}`);
        ws.send(JSON.stringify(settings));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          addLog(`📥 Received: ${message.type}`);
          
          if (message.type === 'AgentReady') {
            addLog('✅ Agent is ready!');
            setStatus('agent-ready');
          }
        } catch (error) {
          addLog(`❌ Failed to parse message: ${error}`);
        }
      };
      
      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        addLog(`❌ WebSocket error: ${JSON.stringify(error)}`);
        addLog(`Error details: ${(error as any).message || 'No message'}`);
        addLog(`Error type: ${(error as any).type || 'Unknown'}`);
        setStatus('ws-error');
      };
      
      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        addLog(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
        addLog(`Clean close: ${event.wasClean}`);
        addLog(`Close code meaning: ${getCloseCodeMeaning(event.code)}`);
        setStatus('disconnected');
      };
      
    } catch (error) {
      addLog(`❌ WebSocket creation error: ${error}`);
      setStatus('ws-error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Deepgram Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Step-by-Step Testing</h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={testToken}
                disabled={status === 'getting-token'}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {status === 'getting-token' ? 'Getting Token...' : 'Step 1: Test Token Endpoint'}
              </button>
              <span className="ml-2 text-sm">
                {status === 'token-success' && '✅ Success'}
                {status === 'token-error' && '❌ Error'}
              </span>
            </div>
            
            <div>
              <button
                onClick={testWebSocket}
                disabled={!token || status === 'connecting'}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {status === 'connecting' ? 'Connecting...' : 'Step 2: Test WebSocket Connection'}
              </button>
              <span className="ml-2 text-sm">
                {status === 'connected' && '✅ Connected'}
                {status === 'agent-ready' && '✅ Agent Ready'}
                {status === 'ws-error' && '❌ Error'}
              </span>
            </div>
            
            <div>
              <button
                onClick={clearLogs}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Start testing to see connection details.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 