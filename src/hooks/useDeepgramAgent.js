"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Deepgram Voice Agent hook with improved audio handling
 * Fixes robot voice issues and provides better error handling
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
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  // Initialize persistent audio context
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      console.log('[DeepgramAgent] 🔊 Initializing persistent audio context...');
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if suspended (required for Chrome)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      console.log('[DeepgramAgent] 🔊 Audio context initialized:', {
        sampleRate: audioContextRef.current.sampleRate,
        state: audioContextRef.current.state
      });
    }
    return audioContextRef.current;
  }, []);

  // Improved TTS audio handler with proper queue management
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
        // Direct ArrayBuffer from WebSocket binary message
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

      // Add to audio queue
      audioQueueRef.current.push(pcmData);
      
      // Start playing if not already playing
      if (!isPlayingRef.current) {
        playAudioQueue();
      }
      
    } catch (error) {
      console.error('[DeepgramAgent] ❌ TTS audio processing error:', error);
      setError(`Audio processing error: ${error.message}`);
    }
  }, []);

  // Play audio queue sequentially to prevent overlapping
  const playAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);

    try {
      const audioContext = initializeAudioContext();
      
      while (audioQueueRef.current.length > 0) {
        const pcmData = audioQueueRef.current.shift();
        
        // Convert Int16 PCM to Float32 for Web Audio API
        const floatData = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          floatData[i] = pcmData[i] / 32768.0;
        }
        
        // Create audio buffer with correct sample rate (16kHz for Deepgram output)
        const audioBuffer = audioContext.createBuffer(1, floatData.length, 16000);
        audioBuffer.getChannelData(0).set(floatData);
        
        console.log('[DeepgramAgent] 🔊 Playing audio chunk:', {
          duration: audioBuffer.duration,
          samples: floatData.length,
          sampleRate: audioBuffer.sampleRate
        });
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        // Wait for this chunk to finish before playing the next
        await new Promise((resolve) => {
          source.onended = resolve;
          source.start(0);
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
        
        // Send Voice Agent settings with consistent audio format
        const settings = {
          type: "Settings",
          audio: {
            input: {
              encoding: "linear16",
              sample_rate: 16000  // Use 16kHz for both input and output
            },
            output: {
              encoding: "linear16", 
              sample_rate: 16000,  // Consistent 16kHz
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
              prompt: "You are a helpful AI assistant. Keep responses concise and friendly."
            },
            speak: {
              provider: {
                type: "deepgram",
                model: "aura-2-thalia-en"  // High-quality voice model
              }
            },
            greeting: "Hello! How can I help you today?"
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
        setError(`WebSocket error: ${JSON.stringify(error)}`);
        setIsConnecting(false);
      };

      ws.onclose = (event) => {
        console.log('[DeepgramAgent] 🔌 WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        setIsListening(false);
        setIsProcessing(false);
      };

    } catch (error) {
      console.error('[DeepgramAgent] ❌ Connection failed:', error);
      setError(`Connection failed: ${error.message}`);
      setIsConnecting(false);
    }
  }, [handleTTSAudio]);

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
      setIsListening(false);
      console.log('[DeepgramAgent] 🛑 Stopped listening');
    } else {
      // Start listening
      try {
        console.log('[DeepgramAgent] 🎤 Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,  // Use 16kHz to match Deepgram settings
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
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const inputData = event.inputBuffer.getChannelData(0);
            const inputSampleRate = event.inputBuffer.sampleRate;
            
            // Resample to 16kHz if needed
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
  }, [isConnected, isListening, connect, initializeAudioContext]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setTranscript('');
    setResponse('');
    setError('');
    // Clear audio queue
    audioQueueRef.current = [];
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
      // Clear audio queue
      audioQueueRef.current = [];
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
    startListening: () => toggleListening(),
    stopListening: () => toggleListening(),
    connect,
    clearConversation
  };
} 