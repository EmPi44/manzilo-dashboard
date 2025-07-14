import { useRef, useState, useCallback, useEffect } from 'react';

export function useOpenAIRealtime({ apiKey, clientSecret, realtimeUrl, onAudioChunk }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  const wsRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionAttemptsRef = useRef(0);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('[useOpenAIRealtime] Starting cleanup...');
    
    if (mediaStreamRef.current) {
      console.log('[useOpenAIRealtime] Stopping media stream tracks');
      mediaStreamRef.current.getTracks().forEach(track => {
        console.log('[useOpenAIRealtime] Stopping track:', track.kind, track.id);
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    
    if (workletNodeRef.current) {
      console.log('[useOpenAIRealtime] Disconnecting worklet node');
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    
    if (audioContextRef.current) {
      console.log('[useOpenAIRealtime] Closing audio context');
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (wsRef.current) {
      console.log('[useOpenAIRealtime] Closing WebSocket connection');
      wsRef.current.close();
      wsRef.current = null;
    }
    
    console.log('[useOpenAIRealtime] Cleanup completed');
  }, []);

  // Create audio worklet processor
  const createAudioWorklet = useCallback(async (audioContext) => {
    try {
      // Create a simple audio worklet for processing
      const workletCode = `
        class AudioProcessor extends AudioWorkletProcessor {
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            const output = outputs[0];
            
            if (input.length > 0) {
              for (let channel = 0; channel < input.length; channel++) {
                const inputChannel = input[channel];
                const outputChannel = output[channel];
                
                for (let i = 0; i < inputChannel.length; i++) {
                  outputChannel[i] = inputChannel[i];
                }
              }
            }
            
            return true;
          }
        }
        registerProcessor('audio-processor', AudioProcessor);
      `;
      
      const blob = new Blob([workletCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      
      await audioContext.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      
      console.log('[useOpenAIRealtime] Audio worklet created successfully');
      return true;
    } catch (error) {
      console.error('[useOpenAIRealtime] Failed to create audio worklet:', error);
      return false;
    }
  }, []);

  // Connect to OpenAI Realtime API via WebSocket
  const connect = useCallback(async () => {
    if (typeof window === 'undefined') {
      console.log('[useOpenAIRealtime] Window not available, skipping connection');
      return;
    }
    
    if (wsRef.current && (wsRef.current.readyState === 0 || wsRef.current.readyState === 1)) {
      console.log('[useOpenAIRealtime] Already connected or connecting, current state:', wsRef.current.readyState);
      return;
    }

    connectionAttemptsRef.current++;
    console.log(`[useOpenAIRealtime] Attempting connection #${connectionAttemptsRef.current} to:`, realtimeUrl);
    
    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Connect to our proxy server
      console.log('[useOpenAIRealtime] Creating WebSocket connection...');
      wsRef.current = new WebSocket(realtimeUrl);
      wsRef.current.binaryType = 'arraybuffer';

      wsRef.current.onopen = () => {
        console.log('[useOpenAIRealtime] ✅ WebSocket connection opened successfully');
        console.log('[useOpenAIRealtime] WebSocket readyState:', wsRef.current.readyState);
        console.log('[useOpenAIRealtime] WebSocket URL:', wsRef.current.url);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        connectionAttemptsRef.current = 0; // Reset attempts on successful connection
      };

      wsRef.current.onclose = (event) => {
        console.log('[useOpenAIRealtime] ❌ WebSocket connection closed');
        console.log('[useOpenAIRealtime] Close event details:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          type: event.type
        });
        
        // Log specific close codes
        switch (event.code) {
          case 1000:
            console.log('[useOpenAIRealtime] Normal closure');
            break;
          case 1001:
            console.log('[useOpenAIRealtime] Going away');
            break;
          case 1002:
            console.log('[useOpenAIRealtime] Protocol error');
            break;
          case 1003:
            console.log('[useOpenAIRealtime] Unsupported data');
            break;
          case 1005:
            console.log('[useOpenAIRealtime] No status received - connection closed without close frame');
            break;
          case 1006:
            console.log('[useOpenAIRealtime] Abnormal closure');
            break;
          case 1007:
            console.log('[useOpenAIRealtime] Invalid frame payload data');
            break;
          case 1008:
            console.log('[useOpenAIRealtime] Policy violation');
            break;
          case 1009:
            console.log('[useOpenAIRealtime] Message too big');
            break;
          case 1010:
            console.log('[useOpenAIRealtime] Client terminating');
            break;
          case 1011:
            console.log('[useOpenAIRealtime] Server error');
            break;
          case 1015:
            console.log('[useOpenAIRealtime] TLS handshake');
            break;
          default:
            console.log('[useOpenAIRealtime] Unknown close code:', event.code);
        }
        
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(`Connection closed: ${event.code} - ${event.reason || 'No reason provided'}`);
        cleanup();
      };

      wsRef.current.onerror = (error) => {
        console.error('[useOpenAIRealtime] ❌ WebSocket error occurred:', error);
        console.error('[useOpenAIRealtime] Error details:', {
          error: error,
          type: error.type,
          target: error.target
        });
        setConnectionError('WebSocket error: ' + (error.message || 'Unknown error'));
        setIsConnected(false);
        setIsConnecting(false);
      };

      wsRef.current.onmessage = (event) => {
        console.log('[useOpenAIRealtime] 📨 Received message from server');
        console.log('[useOpenAIRealtime] Message details:', {
          type: typeof event.data,
          isArrayBuffer: event.data instanceof ArrayBuffer,
          size: event.data instanceof ArrayBuffer ? event.data.byteLength : event.data.length,
          timestamp: new Date().toISOString()
        });
        
        // Handle binary audio data
        if (event.data instanceof ArrayBuffer) {
          console.log('[useOpenAIRealtime] 🔊 Received audio chunk:', event.data.byteLength, 'bytes');
          setIsSpeaking(true);
          if (onAudioChunk) {
            onAudioChunk(event.data);
          }
          // Reset speaking state after a delay
          setTimeout(() => setIsSpeaking(false), 100);
        } else {
          // Handle text messages (events)
          try {
            const data = JSON.parse(event.data);
            console.log('[useOpenAIRealtime] 📝 Received JSON event:', data);
            
            if (data.type === 'conversation.updated') {
              console.log('[useOpenAIRealtime] Conversation updated:', data);
            } else if (data.type === 'error') {
              console.error('[useOpenAIRealtime] Server error:', data.error);
              setConnectionError(data.error || 'Unknown error');
            } else if (data.type === 'session.update') {
              console.log('[useOpenAIRealtime] Session updated:', data);
            } else {
              console.log('[useOpenAIRealtime] Unknown event type:', data.type);
            }
          } catch (error) {
            console.warn('[useOpenAIRealtime] Error parsing message:', error);
            console.warn('[useOpenAIRealtime] Raw message data:', event.data);
          }
        }
      };

    } catch (error) {
      console.error('[useOpenAIRealtime] ❌ Failed to create WebSocket connection:', error);
      setConnectionError(`Connection failed: ${error.message}`);
      setIsConnecting(false);
      cleanup();
    }
  }, [realtimeUrl, cleanup, onAudioChunk]);

  // Start listening with microphone
  const startListening = useCallback(async () => {
    if (typeof window === 'undefined') {
      console.log('[useOpenAIRealtime] Window not available, cannot start listening');
      return;
    }
    
    console.log('[useOpenAIRealtime] 🎤 Starting listening process...');
    console.log('[useOpenAIRealtime] Current connection state:', {
      isConnected,
      isConnecting,
      wsReadyState: wsRef.current?.readyState
    });
    
    if (!isConnected) {
      console.log('[useOpenAIRealtime] Not connected, connecting first...');
      await connect();
      // Wait for connection
      setTimeout(() => {
        if (isConnected) {
          console.log('[useOpenAIRealtime] Connection established, starting listening...');
          startListeningInternal();
        } else {
          console.error('[useOpenAIRealtime] Failed to connect before listening');
          setConnectionError('Failed to connect before listening');
        }
      }, 1000);
      return;
    }
    
    startListeningInternal();
  }, [isConnected, connect]);

  const startListeningInternal = useCallback(async () => {
    try {
      console.log('[useOpenAIRealtime] 🎤 Getting microphone access...');
      
      // Get microphone stream with proper settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('[useOpenAIRealtime] ✅ Microphone access granted');
      console.log('[useOpenAIRealtime] Stream details:', {
        id: stream.id,
        tracks: stream.getTracks().map(t => ({ kind: t.kind, id: t.id, enabled: t.enabled }))
      });
      
      mediaStreamRef.current = stream;
      
      // Create audio context for processing
      console.log('[useOpenAIRealtime] Creating audio context...');
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      console.log('[useOpenAIRealtime] Audio context created:', {
        sampleRate: audioContextRef.current.sampleRate,
        state: audioContextRef.current.state
      });
      
      // Create audio source
      const source = audioContextRef.current.createMediaStreamSource(stream);
      console.log('[useOpenAIRealtime] Media stream source created');
      
      // Try to create audio worklet, fallback to script processor if needed
      let workletCreated = await createAudioWorklet(audioContextRef.current);
      
      if (workletCreated) {
        // Use AudioWorkletNode (modern approach)
        workletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor', {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          outputChannelCount: [1]
        });
        
        workletNodeRef.current.port.onmessage = (event) => {
          console.log('[useOpenAIRealtime] Worklet message:', event.data);
        };
        
        source.connect(workletNodeRef.current);
        workletNodeRef.current.connect(audioContextRef.current.destination);
        
        // Process audio and send to WebSocket
        workletNodeRef.current.port.postMessage({ type: 'start' });
        
        console.log('[useOpenAIRealtime] ✅ AudioWorkletNode created and connected');
      } else {
        // Fallback to ScriptProcessorNode (deprecated but functional)
        console.warn('[useOpenAIRealtime] ⚠️ Falling back to deprecated ScriptProcessorNode');
        
        workletNodeRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        source.connect(workletNodeRef.current);
        workletNodeRef.current.connect(audioContextRef.current.destination);
        
        // Process audio and send to WebSocket
        workletNodeRef.current.onaudioprocess = (event) => {
          if (wsRef.current && wsRef.current.readyState === 1) {
            const input = event.inputBuffer.getChannelData(0);
            // Convert to 16-bit PCM
            const buffer = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) {
              buffer[i] = Math.max(-32768, Math.min(32767, input[i] * 32768));
            }
            
            console.log('[useOpenAIRealtime] 📤 Sending audio chunk:', buffer.length * 2, 'bytes');
            wsRef.current.send(buffer.buffer);
          } else {
            console.warn('[useOpenAIRealtime] WebSocket not ready, dropping audio chunk');
          }
        };
        
        console.log('[useOpenAIRealtime] ✅ ScriptProcessorNode created and connected');
      }
      
      setIsListening(true);
      console.log('[useOpenAIRealtime] 🎤 Started listening and streaming audio');
      
    } catch (error) {
      console.error('[useOpenAIRealtime] ❌ Microphone error:', error);
      console.error('[useOpenAIRealtime] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setConnectionError('Microphone access denied or error: ' + error.message);
    }
  }, [createAudioWorklet]);

  // Stop listening
  const stopListening = useCallback(() => {
    console.log('[useOpenAIRealtime] 🛑 Stopping listening...');
    setIsListening(false);
    
    if (mediaStreamRef.current) {
      console.log('[useOpenAIRealtime] Stopping media stream tracks');
      mediaStreamRef.current.getTracks().forEach(track => {
        console.log('[useOpenAIRealtime] Stopping track:', track.kind, track.id);
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    
    if (workletNodeRef.current) {
      console.log('[useOpenAIRealtime] Disconnecting worklet node');
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    
    console.log('[useOpenAIRealtime] ✅ Stopped listening');
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    console.log('[useOpenAIRealtime] 🔌 Disconnecting...');
    stopListening();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    cleanup();
    setIsConnected(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    console.log('[useOpenAIRealtime] ✅ Disconnected');
  }, [stopListening, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('[useOpenAIRealtime] Component mounted, cleanup function registered');
    return () => {
      console.log('[useOpenAIRealtime] Component unmounting, running cleanup');
      cleanup();
    };
  }, [cleanup]);

  return {
    isConnected,
    isConnecting,
    isListening,
    isSpeaking,
    connectionError,
    connect,
    startListening,
    stopListening,
    disconnect,
  };
} 