const WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });

async function testDeepgramConnection() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  
  if (!apiKey) {
    console.error('❌ DEEPGRAM_API_KEY not found in .env.local');
    return;
  }

  console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');

  // Test 1: Try the agent endpoint
  console.log('\n🔌 Test 1: Connecting to /v1/listen/agent');
  const ws1 = new WebSocket('wss://api.deepgram.com/v1/listen/agent', ['token', apiKey]);

  ws1.on('open', () => {
    console.log('✅ Agent endpoint connected!');
    
    const settings = {
      type: "Settings",
      audio: {
        input: { encoding: "linear16", sample_rate: 16000 },
        output: { encoding: "linear16", sample_rate: 24000 }
      },
      agent: {
        listen: { provider: { model: "nova-3" } },
        think: { provider: { type: "open_ai", model: "gpt-4o-mini", url: "http://localhost:3000/api/deepgram/chat" } },
        speak: { provider: { model: "aura-2-en" } }
      }
    };
    
    console.log('📤 Sending settings...');
    ws1.send(JSON.stringify(settings));
  });

  ws1.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📥 Received:', message.type);
      
      if (message.type === 'AgentReady') {
        console.log('🎉 Agent is ready!');
        ws1.close();
      }
    } catch (error) {
      console.log('❌ Parse error:', error.message);
    }
  });

  ws1.on('error', (error) => {
    console.log('❌ Agent endpoint error:', error.message);
  });

  ws1.on('close', (code, reason) => {
    console.log(`🔌 Agent endpoint closed: ${code} - ${reason}`);
  });

  // Test 2: Try the standard endpoint
  setTimeout(() => {
    console.log('\n🔌 Test 2: Connecting to /v1/listen');
    const ws2 = new WebSocket('wss://api.deepgram.com/v1/listen', ['token', apiKey]);

    ws2.on('open', () => {
      console.log('✅ Standard endpoint connected!');
      ws2.close();
    });

    ws2.on('error', (error) => {
      console.log('❌ Standard endpoint error:', error.message);
    });

    ws2.on('close', (code, reason) => {
      console.log(`🔌 Standard endpoint closed: ${code} - ${reason}`);
    });
  }, 2000);

  // Test 3: Try with Authorization header instead of subprotocol
  setTimeout(() => {
    console.log('\n🔌 Test 3: Connecting with Authorization header');
    const ws3 = new WebSocket('wss://api.deepgram.com/v1/listen/agent', {
      headers: {
        'Authorization': `Token ${apiKey}`
      }
    });

    ws3.on('open', () => {
      console.log('✅ Authorization header connected!');
      ws3.close();
    });

    ws3.on('error', (error) => {
      console.log('❌ Authorization header error:', error.message);
    });

    ws3.on('close', (code, reason) => {
      console.log(`🔌 Authorization header closed: ${code} - ${reason}`);
    });
  }, 4000);
}

testDeepgramConnection().catch(console.error); 