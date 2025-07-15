"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Deepgram Voice Agent message types based on official documentation
 * @typedef {Object} DeepgramMessage
 * @property {string} type - Message type
 */

/**
 * Deepgram Voice Agent Settings message
 * @typedef {Object} DeepgramSettings
 * @property {'Settings'} type - Message type
 * @property {Object} agent - Agent configuration
 * @property {Object} agent.listen - Listen provider configuration
 * @property {Object} agent.think - Think provider configuration
 * @property {Object} agent.speak - Speak provider configuration
 */

/**
 * Deepgram Voice Agent Results message
 * @typedef {Object} DeepgramResults
 * @property {'Results'} type - Message type
 * @property {boolean} is_final - Whether this is the final result
 * @property {Object} channel - Channel data
 * @property {Array<{transcript: string, confidence: number}>} channel.alternatives - Transcript alternatives
 */

/**
 * Deepgram Voice Agent Error message
 * @typedef {Object} DeepgramError
 * @property {'Error'} type - Message type
 * @property {string} error - Error message
 */

/**
 * Deepgram Voice Agent Ready message
 * @typedef {Object} DeepgramAgentReady
 * @property {'AgentReady'} type - Message type
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

  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);

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
      console.log('[DeepgramAgent] 🔌 Using subprotocols:', ['token', token ? '***' : 'null']);
      
      const ws = new WebSocket(wsUrl, ['token', token]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[DeepgramAgent] 🔌 Connected to Deepgram Voice Agent');
        setIsConnected(true);
        setIsConnecting(false);
        
        // Send Voice Agent settings based on official documentation
        const settings = {
          type: "Settings",
          audio: {
            input: {
              encoding: "linear16",
              sample_rate: 24000
            },
            output: {
              encoding: "linear16", 
              sample_rate: 24000,
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
              prompt: "You are a friendly AI assistant."
            },
            speak: {
              provider: {
                type: "deepgram",
                model: "aura-2-thalia-en"
              }
            },
            greeting: "Hello! How can I help you today?"
          }
        };
        
        console.log('[DeepgramAgent] 📤 Sending Voice Agent settings:', JSON.stringify(settings, null, 2));
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
          } else if (message.type === 'AudioData') {
            // Handle TTS audio from Deepgram
            console.log('[DeepgramAgent] 🔊 Received TTS audio data');
            handleTTSAudio(message.data);
          } else if (message.type === 'Error') {
            console.error('[DeepgramAgent] ❌ Deepgram error message:', message);
            console.error('[DeepgramAgent] ❌ Error details:', {
              type: message.type,
              error: message.error,
              message: message.message,
              details: message.details,
              code: message.code,
              fullMessage: JSON.stringify(message, null, 2)
            });
            const errorMessage = message.error || message.message || message.details || JSON.stringify(message);
            setError(`Deepgram error: ${errorMessage}`);
            setIsProcessing(false);
          } else {
            console.log('[DeepgramAgent] 📨 Other message type:', message.type, JSON.stringify(message, null, 2));
          }
        } catch (error) {
          console.error('[DeepgramAgent] ❌ Failed to parse message:', error);
          console.error('[DeepgramAgent] Raw message:', event.data);
          setError(`Message parse error: ${error.message}`);
        }
      };

      ws.onerror = (error) => {
        console.error('[DeepgramAgent] ❌ WebSocket error:', error);
        console.error('[DeepgramAgent] ❌ WebSocket error details:', {
          type: error.type,
          message: error.message,
          target: error.target,
          readyState: ws.readyState,
          url: ws.url,
          protocol: ws.protocol
        });
        const errorMessage = error instanceof Error ? error.message : 'WebSocket connection failed';
        setError(`WebSocket error: ${errorMessage}`);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log('[DeepgramAgent] 🔌 Connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        if (!event.wasClean) {
          const closeReason = event.reason || 'Unknown reason';
          const closeCode = event.code;
          console.error('[DeepgramAgent] ❌ Connection closed abnormally:', { code: closeCode, reason: closeReason });
          setError(`Connection closed: ${closeCode} - ${closeReason}`);
        }
        
        setIsConnected(false);
        setIsConnecting(false);
        setIsListening(false);
        setIsProcessing(false);
        setIsSpeaking(false);
      };

    } catch (error) {
      console.error('[DeepgramAgent] ❌ Connection failed:', error);
      setError(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting]);

  // Handle TTS audio from Deepgram
  const handleTTSAudio = useCallback((audioData) => {
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

    setIsSpeaking(true);
    
    try {
      let pcmData;
      
      if (audioData instanceof ArrayBuffer) {
        // Direct ArrayBuffer from WebSocket binary message (raw PCM)
        pcmData = new Int16Array(audioData);
        console.log('[DeepgramAgent] 🔊 Using ArrayBuffer directly, PCM samples:', pcmData.length);
      } else if (typeof audioData === 'string') {
        // Base64 string from JSON message
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
      
      // Create audio context and play the raw PCM audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[DeepgramAgent] 🔊 Created audio context, sample rate:', audioContext.sampleRate);
      
      // Convert Int16 PCM to Float32 for Web Audio API
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        floatData[i] = pcmData[i] / 32768.0; // Convert from Int16 to Float32
      }
      
      // Create audio buffer from PCM data
      const audioBuffer = audioContext.createBuffer(1, floatData.length, 24000); // Deepgram uses 24kHz
      audioBuffer.getChannelData(0).set(floatData);
      
      console.log('[DeepgramAgent] 🔊 Audio buffer created:', {
        duration: audioBuffer.duration,
        numberOfChannels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate,
        length: audioBuffer.length
      });
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      source.onended = () => {
        console.log('[DeepgramAgent] 🔊 Audio playback finished');
        setIsSpeaking(false);
      };
      
    } catch (error) {
      console.error('[DeepgramAgent] ❌ TTS audio error:', error);
      setIsSpeaking(false);
    }
  }, []);

  // Start/stop listening with proper audio handling
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
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
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
            noiseSuppression: true
          }
        });
        
        console.log('[DeepgramAgent] 🎤 Microphone access granted:', {
          tracks: stream.getTracks().length,
          trackSettings: stream.getTracks().map(track => track.getSettings())
        });
        
        streamRef.current = stream;
        
        // Create audio context and processor for real-time audio
        console.log('[DeepgramAgent] 🎤 Creating audio context...');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        console.log('[DeepgramAgent] 🎤 Audio context created:', {
          sampleRate: audioContext.sampleRate,
          state: audioContext.state
        });
        
        // Check if we need to resample
        const streamSampleRate = stream.getAudioTracks()[0]?.getSettings()?.sampleRate || 48000;
        console.log('[DeepgramAgent] 🎤 Stream sample rate:', streamSampleRate, 'AudioContext sample rate:', audioContext.sampleRate);
        
        if (streamSampleRate !== audioContext.sampleRate) {
          console.log('[DeepgramAgent] 🎤 Sample rates don\'t match, will resample audio');
        }
        
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (event) => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const inputData = event.inputBuffer.getChannelData(0);
            const inputSampleRate = event.inputBuffer.sampleRate;
            
            // Resample to 16kHz if needed (Deepgram expects 16kHz)
            let resampledData = inputData;
            if (inputSampleRate !== 16000) {
              console.log('[DeepgramAgent] 🎤 Resampling from', inputSampleRate, 'to 16000 Hz');
              const ratio = 16000 / inputSampleRate;
              const newLength = Math.round(inputData.length * ratio);
              resampledData = new Float32Array(newLength);
              
              for (let i = 0; i < newLength; i++) {
                const oldIndex = i / ratio;
                const index1 = Math.floor(oldIndex);
                const index2 = Math.min(index1 + 1, inputData.length - 1);
                const fraction = oldIndex - index1;
                resampledData[i] = inputData[index1] * (1 - fraction) + inputData[index2] * fraction;
              }
            }
            
            // Convert to 16-bit PCM
            const pcmData = new Int16Array(resampledData.length);
            for (let i = 0; i < resampledData.length; i++) {
              pcmData[i] = Math.max(-32768, Math.min(32767, resampledData[i] * 32768));
            }
            
            console.log('[DeepgramAgent] 🎤 Sending audio chunk:', {
              originalSamples: inputData.length,
              resampledSamples: pcmData.length,
              bytes: pcmData.buffer.byteLength,
              originalSampleRate: inputSampleRate,
              targetSampleRate: 16000,
              channels: event.inputBuffer.numberOfChannels
            });
            
            wsRef.current.send(pcmData.buffer);
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
  }, [isConnected, isListening, connect]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setTranscript('');
    setResponse('');
    setError('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
    };
  }, []);

  return {
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
  };
} 