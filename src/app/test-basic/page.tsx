"use client";

import { useState } from 'react';

export default function TestBasic() {
  const [logs, setLogs] = useState<string[]>([]);
  const [token, setToken] = useState<string>('');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  // Step 1: Get token
  const getToken = async () => {
    addLog('🔑 Getting token...');
    try {
      const response = await fetch('/api/deepgram/token');
      const data = await response.json();
      setToken(data.token);
      addLog(`✅ Token: ${data.token.substring(0, 10)}...`);
    } catch (error) {
      addLog(`❌ Token error: ${error}`);
    }
  };

  // Step 2: Test basic WebSocket connection
  const testBasicConnection = () => {
    if (!token) {
      addLog('❌ No token available');
      return;
    }

    addLog('🔌 Testing basic WebSocket connection...');
    
    // Create WebSocket with minimal configuration
    const ws = new WebSocket('wss://agent.deepgram.com/v1/agent/converse', ['token', token]);
    
    ws.onopen = () => {
      addLog('✅ WebSocket connected!');
      addLog('📤 Sending minimal settings...');
      
      // Send the most basic settings possible
      const minimalSettings = {
        type: "Settings",
        agent: {
          listen: {
            provider: {
              model: "nova-3"
            }
          },
          think: {
            provider: {
              type: "open_ai",
              model: "gpt-4o-mini"
            }
          },
          speak: {
            provider: {
              type: "deepgram",
              model: "aura-2-thalia-en"
            }
          }
        }
      };
      
      ws.send(JSON.stringify(minimalSettings));
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        addLog(`📥 Received: ${message.type}`);
        addLog(`📥 Full message: ${JSON.stringify(message, null, 2)}`);
        
        if (message.type === 'AgentReady') {
          addLog('🎉 Agent is ready!');
        } else if (message.type === 'Error') {
          addLog(`❌ Deepgram error: ${message.error || 'Unknown error'}`);
        }
      } catch (error) {
        addLog(`❌ Parse error: ${error}`);
        addLog(`❌ Raw data: ${event.data}`);
      }
    };
    
    ws.onerror = (error) => {
      addLog(`❌ WebSocket error: ${JSON.stringify(error)}`);
    };
    
    ws.onclose = (event) => {
      addLog(`🔌 WebSocket closed: ${event.code} - ${event.reason || 'No reason'}`);
      addLog(`Clean close: ${event.wasClean}`);
    };
  };

  // Step 3: Test with official Deepgram format
  const testOfficialFormat = () => {
    if (!token) {
      addLog('❌ No token available');
      return;
    }

    addLog('🔌 Testing official Deepgram format...');
    
    const ws = new WebSocket('wss://agent.deepgram.com/v1/agent/converse', ['token', token]);
    
    ws.onopen = () => {
      addLog('✅ Official format connected!');
      addLog('📤 Sending official settings...');
      
      // Official Deepgram Voice Agent settings format
      const officialSettings = {
        type: "Settings",
        agent: {
          listen: {
            provider: {
              model: "nova-3"
            }
          },
          think: {
            provider: {
              type: "open_ai",
              model: "gpt-4o-mini"
            }
          },
          speak: {
            provider: {
              type: "deepgram",
              model: "aura-2-thalia-en"
            }
          }
        }
      };
      
      addLog(`📤 Settings: ${JSON.stringify(officialSettings, null, 2)}`);
      ws.send(JSON.stringify(officialSettings));
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        addLog(`📥 Official received: ${message.type}`);
        addLog(`📥 Official full: ${JSON.stringify(message, null, 2)}`);
        
        if (message.type === 'AgentReady') {
          addLog('🎉 Official agent is ready!');
        } else if (message.type === 'Error') {
          addLog(`❌ Official error: ${message.error || 'Unknown error'}`);
        }
      } catch (error) {
        addLog(`❌ Official parse error: ${error}`);
        addLog(`❌ Official raw: ${event.data}`);
      }
    };
    
    ws.onerror = (error) => {
      addLog(`❌ Official error: ${JSON.stringify(error)}`);
    };
    
    ws.onclose = (event) => {
      addLog(`🔌 Official closed: ${event.code} - ${event.reason || 'No reason'}`);
    };
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Basic Deepgram Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Minimal Testing</h2>
          
          <div className="space-y-4">
            <button
              onClick={getToken}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Step 1: Get Token
            </button>
            
            <button
              onClick={testBasicConnection}
              disabled={!token}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Step 2: Test Basic Connection
            </button>
            
            <button
              onClick={testOfficialFormat}
              disabled={!token}
              className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Step 3: Test Regular API
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Clear Logs
            </button>
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