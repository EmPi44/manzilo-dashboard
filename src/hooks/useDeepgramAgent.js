"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Deepgram Voice Agent hook with optimized audio quality
 * Implements fixes for robotic voice artifacts
 */
export function useDeepgramAgent() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);

  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const audioBufferRef = useRef(null);
  const lastPlayTimeRef = useRef(0);
  const heartbeatRef = useRef(null);
  const lastAudioSentRef = useRef(0);
  
  // VAD and turn-taking state
  const vadTimeoutRef = useRef(null);
  const silenceThresholdRef = useRef(1500); // 1.5 seconds of silence
  const lastSpeechTimeRef = useRef(0);
  const isUserSpeakingRef = useRef(false);
  const canInterruptRef = useRef(true);

  // Audio quality optimization state
  const playCursorRef = useRef(0);
  const ringBufferRef = useRef(new Float32Array(16000 * 2)); // 2 seconds at 16kHz
  const ringBufferIndexRef = useRef(0);

  // VAD: Detect speech activity in audio data
  const detectSpeechActivity = useCallback((audioData) => {
    // Calculate RMS (Root Mean Square) to detect speech
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    
    // Threshold for speech detection (adjust based on testing)
    const speechThreshold = 0.01;
    return rms > speechThreshold;
  }, []);

  // Heartbeat to keep WebSocket connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    
    heartbeatRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const now = Date.now();
        const timeSinceLastAudio = now - lastAudioSentRef.current;
        
        // If no audio sent in 2 seconds, send a silent audio chunk to keep connection alive
        if (timeSinceLastAudio > 2000) {
          console.log('[DeepgramAgent] 💓 Sending heartbeat to keep connection alive');
          const silentChunk = new Int16Array(1600).fill(0); // 100ms of silence at 16kHz
          wsRef.current.send(silentChunk.buffer);
          lastAudioSentRef.current = now;
        }
      }
    }, 1000); // Check every second
  }, []);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // Stop AI speech when user interrupts
  const stopAISpeech = useCallback(() => {
    console.log('[DeepgramAgent] 🛑 Stopping AI speech due to user interruption');
    
    // Clear audio queue
    audioQueueRef.current = [];
    
    // Stop current audio playback
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
    }
    
    // Note: Deepgram handles interruptions automatically when it detects user speech
    console.log('[DeepgramAgent] 🛑 AI speech stopped - Deepgram will handle interruption detection');
  }, []);

  // Initialize audio context with proper settings
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      console.log('[DeepgramAgent] 🔊 Initializing audio context...');
      // Use default sample rate to avoid conflicts
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if suspended (required for Chrome)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      console.log('[DeepgramAgent] 🔊 Audio context initialized:', {
        sampleRate: audioContextRef.current.sampleRate,
        state: audioContextRef.current.state,
        baseLatency: audioContextRef.current.baseLatency
      });
    }
    return audioContextRef.current;
  }, []);

  // Simple and reliable audio playback
  const handleTTSAudio = useCallback(async (audioData) => {
    if (!audioData) {
      console.log('[DeepgramAgent] 🔊 No audio data received');
      return;
    }

    console.log('[DeepgramAgent] 🔊 Processing TTS audio:', {
      type: typeof audioData,
      isArrayBuffer: audioData instanceof ArrayBuffer,
      isBase64: typeof audioData === 'string',
      size: audioData instanceof ArrayBuffer ? audioData.byteLength : audioData.length
    });

    try {
      let pcmData;
      
      if (audioData instanceof ArrayBuffer) {
        pcmData = new Int16Array(audioData);
        console.log('[DeepgramAgent] 🔊 Using ArrayBuffer directly, PCM samples:', pcmData.length);
      } else if (typeof audioData === 'string') {
        console.log('[DeepgramAgent] 🔊 Converting base64 to PCM data');
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        pcmData = new Int16Array(bytes.buffer);
        console.log('[DeepgramAgent] 🔊 Converted base64 to PCM data, samples:', pcmData.length);
      } else {
        throw new Error(`Unsupported audio data type: ${typeof audioData}`);
      }

      // Convert Int16 PCM to Float32 for Web Audio API
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 32768.0;
      }

      // Add to audio queue
      audioQueueRef.current.push(floatData);
      
      // Start playing if not already playing and we have enough audio data
      // Wait for 3 chunks to reduce gaps, but start after 1 second if we have fewer
      if (!isPlayingRef.current) {
        if (audioQueueRef.current.length >= 3) {
          playAudioQueue();
        } else if (audioQueueRef.current.length >= 1) {
          // Start after a short delay to see if more chunks arrive
          setTimeout(() => {
            if (!isPlayingRef.current && audioQueueRef.current.length >= 1) {
              playAudioQueue();
            }
          }, 200); // 200ms delay
        }
      }
      
    } catch (error) {
      console.error('[DeepgramAgent] ❌ TTS audio processing error:', error);
      setError(`Audio processing error: ${error.message}`);
    }
  }, []);

  // Simple sequential audio playback
  const playAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);

    try {
      const audioContext = initializeAudioContext();
      
      console.log('[DeepgramAgent] 🔊 Starting audio playback, chunks:', audioQueueRef.current.length);
      
      // Play chunks sequentially with minimal gaps
      while (audioQueueRef.current.length > 0) {
        const floatData = audioQueueRef.current.shift();
        
        // Create audio buffer at 16kHz (Deepgram's output rate)
        const audioBuffer = audioContext.createBuffer(1, floatData.length, 16000);
        audioBuffer.getChannelData(0).set(floatData);
        
        console.log('[DeepgramAgent] 🔊 Playing audio chunk:', {
          samples: floatData.length,
          duration: audioBuffer.duration,
          remainingChunks: audioQueueRef.current.length
        });
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        // Play immediately
        source.start();
        
        // Wait for this chunk to finish completely
        await new Promise((resolve) => {
          source.onended = resolve;
        });
      }
      
    } catch (error) {
      console.error('[DeepgramAgent] ❌ Audio playback error:', error);
      setError(`Audio playback error: ${error.message}`);
    } finally {
      isPlayingRef.current = false;
      setIsSpeaking(false);
    }
  }, [initializeAudioContext]);



  // Initialize WebSocket connection to Deepgram Voice Agent
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError('');

    try {
      // Get API key
      console.log('[DeepgramAgent] 🔑 Requesting API key...');
      const tokenResponse = await fetch('/api/deepgram/token');
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Failed to get API key: ${tokenResponse.status} ${errorText}`);
      }
      const { token } = await tokenResponse.json();
      console.log('[DeepgramAgent] 🔑 Got API key:', token ? `${token.substring(0, 10)}...` : 'null');

      // Use the Deepgram Voice Agent endpoint
      const wsUrl = 'wss://agent.deepgram.com/v1/agent/converse';
      console.log('[DeepgramAgent] 🔌 Connecting to Voice Agent:', wsUrl);
      
      const ws = new WebSocket(wsUrl, ['token', token]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[DeepgramAgent] 🔌 Connected to Deepgram Voice Agent');
        setIsConnected(true);
        setIsConnecting(false);
        lastAudioSentRef.current = Date.now();
        startHeartbeat();
        
        // Send Voice Agent settings optimized for audio quality
        const settings = {
          type: "Settings",
          audio: {
            input: {
              encoding: "linear16",
              sample_rate: 16000
            },
            output: {
              encoding: "linear16", 
              sample_rate: 16000,  // Back to 16kHz for compatibility
              container: "wav"
            }
          },
          agent: {
            language: "en",
            listen: {
              provider: {
                type: "deepgram",
                model: "nova-3"
              }
            },
            think: {
              provider: {
                type: "open_ai",
                model: "gpt-4o-mini"
              },
              prompt: `You are a friendly, conversational AI assistant. Follow these guidelines:

1. **Natural Conversation**: Use casual, human-like language with natural pauses and conversational markers like "um", "well", "you know"
2. **Concise Responses**: Keep responses under 2-3 sentences unless detailed explanation is needed
3. **Context Awareness**: Remember previous parts of the conversation
4. **Emotional Intelligence**: Show empathy and understanding
5. **Interactive Style**: Ask follow-up questions when appropriate
6. **Professional but Warm**: Be helpful and knowledgeable while maintaining a friendly tone

Current context: You're helping with a property management dashboard. Be conversational and natural in your responses.`
            },
            speak: {
              provider: {
                type: "deepgram",
                model: "aura-2-asteria-en"  // High-quality voice model
              }
            },
            greeting: "Hi there! I'm your AI assistant. I'm here to help you with your property management dashboard. What would you like to know?"
          }
        };
        
        console.log('[DeepgramAgent] 📤 Sending settings:', JSON.stringify(settings, null, 2));
        ws.send(JSON.stringify(settings));
      };

      ws.onmessage = (event) => {
        try {
          console.log('[DeepgramAgent] 📥 Raw message received:', {
            type: typeof event.data,
            isBlob: event.data instanceof Blob,
            isString: typeof event.data === 'string',
            size: event.data instanceof Blob ? event.data.size : event.data.length,
            preview: typeof event.data === 'string' ? event.data.substring(0, 200) + '...' : 'Binary data'
          });
          
          // Check if the message is binary data (Blob) or JSON
          if (event.data instanceof Blob) {
            console.log('[DeepgramAgent] 🔊 Received binary audio data, size:', event.data.size);
            // Handle binary audio data
            event.data.arrayBuffer().then(buffer => {
              console.log('[DeepgramAgent] 🔊 Converting blob to ArrayBuffer, size:', buffer.byteLength);
              handleTTSAudio(buffer);
            });
            return;
          }
          
          // Try to parse as JSON
          const message = JSON.parse(event.data);
          console.log('[DeepgramAgent] 📥 Parsed message:', JSON.stringify(message, null, 2));

          if (message.type === 'Welcome') {
            console.log('[DeepgramAgent] 🎉 Welcome message received:', message);
            setIsConnected(true);
            setIsConnecting(false);
          } else if (message.type === 'SettingsApplied') {
            console.log('[DeepgramAgent] ✅ Settings applied:', message);
          } else if (message.type === 'ConversationText') {
            console.log('[DeepgramAgent] 💬 Conversation text:', message);
            if (message.text) {
              setTranscript(message.text);
              // Add to conversation history
              setConversationHistory(prev => [...prev, { role: 'user', content: message.text, timestamp: Date.now() }]);
            }
          } else if (message.type === 'UserStartedSpeaking') {
            console.log('[DeepgramAgent] 🎤 User started speaking:', message);
            setIsListening(true);
          } else if (message.type === 'AgentThinking') {
            console.log('[DeepgramAgent] 🤔 Agent thinking:', message);
            setIsProcessing(true);
          } else if (message.type === 'AgentStartedSpeaking') {
            console.log('[DeepgramAgent] 🔊 Agent started speaking:', message);
            setIsSpeaking(true);
            setIsProcessing(false);
            // Add AI response to conversation history
            if (message.response) {
              setConversationHistory(prev => [...prev, { role: 'assistant', content: message.response, timestamp: Date.now() }]);
            }
          } else if (message.type === 'AudioData') {
            // Handle TTS audio from Deepgram
            console.log('[DeepgramAgent] 🔊 Received TTS audio data');
            handleTTSAudio(message.data);
          } else if (message.type === 'Error') {
            console.error('[DeepgramAgent] ❌ Deepgram error message:', message);
            const errorMessage = message.error || message.message || message.details || JSON.stringify(message);
            setError(`Deepgram error: ${errorMessage}`);
            setIsProcessing(false);
          } else {
            console.log('[DeepgramAgent] 📨 Other message type:', message.type, JSON.stringify(message, null, 2));
          }
        } catch (err) {
          console.error('[DeepgramAgent] ❌ Failed to parse message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('[DeepgramAgent] ❌ WebSocket error:', error);
        setError(`WebSocket error: ${JSON.stringify(error)}`);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log('[DeepgramAgent] 🔌 WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsListening(false);
        setIsProcessing(false);
        setIsConnecting(false);
      };
      
    } catch (err) {
      console.error('[DeepgramAgent] ❌ Connection failed:', err);
      setError(`Connection failed: ${err.message}`);
      setIsConnecting(false);
    }
  }, [handleTTSAudio]);

  // Start/stop listening with optimized audio processing
  const toggleListening = useCallback(async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (isListening) {
      // Stop listening
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
      setIsListening(false);
      console.log('[DeepgramAgent] 🛑 Stopped listening');
    } else {
      // Start listening
      try {
        console.log('[DeepgramAgent] 🎤 Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        console.log('[DeepgramAgent] 🎤 Microphone access granted:', {
          tracks: stream.getTracks().length,
          trackSettings: stream.getTracks().map(track => track.getSettings())
        });
        
        streamRef.current = stream;
        
        // Create audio context and processor for real-time audio
        console.log('[DeepgramAgent] 🎤 Creating audio context...');
        const audioContext = initializeAudioContext();
        
        console.log('[DeepgramAgent] 🎤 Audio context created:', {
          sampleRate: audioContext.sampleRate,
          state: audioContext.state
        });
        
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          try {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              const inputData = event.inputBuffer.getChannelData(0);
              const inputSampleRate = event.inputBuffer.sampleRate;
              
              // VAD: Detect speech activity for local interruption handling
              const speechDetected = detectSpeechActivity(inputData);
              if (speechDetected) {
                lastSpeechTimeRef.current = Date.now();
                isUserSpeakingRef.current = true;
                
                // Clear any existing VAD timeout
                if (vadTimeoutRef.current) {
                  clearTimeout(vadTimeoutRef.current);
                  vadTimeoutRef.current = null;
                }
                
                // If AI is speaking and user starts talking, allow interruption
                if (isSpeaking && canInterruptRef.current) {
                  console.log('[DeepgramAgent] 🎤 User interruption detected, stopping AI speech');
                  stopAISpeech();
                }
              }
              
              // Set VAD timeout to detect end of speech (for local state management)
              if (isUserSpeakingRef.current && !speechDetected) {
                if (vadTimeoutRef.current) {
                  clearTimeout(vadTimeoutRef.current);
                }
                vadTimeoutRef.current = setTimeout(() => {
                  if (Date.now() - lastSpeechTimeRef.current > silenceThresholdRef.current) {
                    console.log('[DeepgramAgent] 🎤 VAD: User stopped speaking (local detection)');
                    isUserSpeakingRef.current = false;
                  }
                }, silenceThresholdRef.current);
              }
              
              // Send audio directly without manual resampling - let Deepgram handle it
              // This eliminates the aliasing artifacts from linear interpolation
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const sample = Math.max(-1, Math.min(1, inputData[i]));
                pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
              }
              
              // Only log occasionally to avoid console spam
              if (Math.random() < 0.01) { // Log 1% of the time
                console.log('[DeepgramAgent] 🎤 Sending audio chunk:', {
                  originalSamples: inputData.length,
                  pcmSamples: pcmData.length,
                  bytes: pcmData.buffer.byteLength,
                  originalSampleRate: inputSampleRate,
                  channels: event.inputBuffer.numberOfChannels,
                  speechDetected,
                  isUserSpeaking: isUserSpeakingRef.current,
                  wsReadyState: wsRef.current.readyState
                });
              }
              
              // Send audio data to Deepgram
              wsRef.current.send(pcmData.buffer);
              lastAudioSentRef.current = Date.now();
            } else {
              console.warn('[DeepgramAgent] ⚠️ WebSocket not ready, skipping audio send:', {
                wsExists: !!wsRef.current,
                wsReadyState: wsRef.current?.readyState
              });
            }
          } catch (error) {
            console.error('[DeepgramAgent] ❌ Audio processing error:', error);
            // Don't set error state here as it might be temporary
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        setIsListening(true);
        setTranscript('');
        setResponse('');
        setError('');
        
        console.log('[DeepgramAgent] 🎤 Started listening');

      } catch (error) {
        console.error('[DeepgramAgent] ❌ Failed to start listening:', error);
        setError(`Microphone error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [isConnected, isListening, isSpeaking, connect, initializeAudioContext, detectSpeechActivity, stopAISpeech]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setTranscript('');
    setResponse('');
    setError('');
    setConversationHistory([]);
    // Clear audio buffers
    audioQueueRef.current = [];
    lastPlayTimeRef.current = 0;
    
    // Clear VAD timeouts
    if (vadTimeoutRef.current) {
      clearTimeout(vadTimeoutRef.current);
      vadTimeoutRef.current = null;
    }
    isUserSpeakingRef.current = false;
    
    // Clear audio state
    playCursorRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      // Clear audio buffers
      audioQueueRef.current = [];
      lastPlayTimeRef.current = 0;
      playCursorRef.current = 0;
      
      // Stop any current playback
      if (isPlayingRef.current) {
        isPlayingRef.current = false;
        setIsSpeaking(false);
      }
    };
  }, [stopHeartbeat]);

  return {
    isConnected,
    isConnecting,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    response,
    error,
    conversationHistory,
    startListening: () => toggleListening(),
    stopListening: () => toggleListening(),
    connect,
    clearConversation
  };
} 