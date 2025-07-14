"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOpenAIRealtime } from "../hooks/useOpenAIRealtime";

// Ogg/Opus streaming audio player hook
function useOggStreamPlayer() {
  const audioRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const queueRef = useRef([]);
  const [mediaSourceReady, setMediaSourceReady] = useState(false);
  const chunkCountRef = useRef(0);

  useEffect(() => {
    if (!audioRef.current) {
      console.log('[OggStreamPlayer] Audio ref not available');
      return;
    }
    
    console.log('[OggStreamPlayer] 🎵 Initializing MediaSource for Ogg/Opus streaming');
    mediaSourceRef.current = new window.MediaSource();
    audioRef.current.src = URL.createObjectURL(mediaSourceRef.current);
    
    console.log('[OggStreamPlayer] MediaSource created, URL:', audioRef.current.src);
    
    mediaSourceRef.current.addEventListener('sourceopen', () => {
      try {
        console.log('[OggStreamPlayer] ✅ MediaSource sourceopen event fired');
        sourceBufferRef.current = mediaSourceRef.current.addSourceBuffer('audio/ogg; codecs=opus');
        console.log('[OggStreamPlayer] SourceBuffer added with MIME type: audio/ogg; codecs=opus');
        setMediaSourceReady(true);
        
        sourceBufferRef.current.addEventListener('updateend', () => {
          console.log('[OggStreamPlayer] 📝 SourceBuffer updateend event');
          // Flush any queued chunks
          if (queueRef.current.length > 0 && !sourceBufferRef.current.updating) {
            const chunk = queueRef.current.shift();
            try {
              sourceBufferRef.current.appendBuffer(chunk);
              console.log('[OggStreamPlayer] ✅ Flushed queued chunk, remaining in queue:', queueRef.current.length);
            } catch (e) {
              console.error('[OggStreamPlayer] ❌ Error appending queued chunk:', e);
              queueRef.current.unshift(chunk); // put it back
            }
          }
        });
        
        sourceBufferRef.current.addEventListener('error', (e) => {
          console.error('[OggStreamPlayer] ❌ SourceBuffer error:', e);
        });
        
        sourceBufferRef.current.addEventListener('abort', (e) => {
          console.warn('[OggStreamPlayer] ⚠️ SourceBuffer abort:', e);
        });
        
      } catch (e) {
        console.error('[OggStreamPlayer] ❌ Failed to add SourceBuffer:', e);
        console.error('[OggStreamPlayer] Error details:', {
          name: e.name,
          message: e.message,
          stack: e.stack
        });
      }
    });
    
    mediaSourceRef.current.addEventListener('error', (e) => {
      console.error('[OggStreamPlayer] ❌ MediaSource error:', e);
    });
    
    mediaSourceRef.current.addEventListener('sourceended', () => {
      console.log('[OggStreamPlayer] MediaSource sourceended');
    });
    
    // Audio element event listeners
    audioRef.current.addEventListener('loadstart', () => {
      console.log('[OggStreamPlayer] Audio loadstart');
    });
    
    audioRef.current.addEventListener('canplay', () => {
      console.log('[OggStreamPlayer] ✅ Audio canplay');
    });
    
    audioRef.current.addEventListener('play', () => {
      console.log('[OggStreamPlayer] 🎵 Audio play started');
    });
    
    audioRef.current.addEventListener('playing', () => {
      console.log('[OggStreamPlayer] 🎵 Audio playing');
    });
    
    audioRef.current.addEventListener('pause', () => {
      console.log('[OggStreamPlayer] ⏸️ Audio paused');
    });
    
    audioRef.current.addEventListener('ended', () => {
      console.log('[OggStreamPlayer] ⏹️ Audio ended');
    });
    
    audioRef.current.addEventListener('error', (e) => {
      console.error('[OggStreamPlayer] ❌ Audio error:', e);
      console.error('[OggStreamPlayer] Audio error details:', {
        error: audioRef.current.error,
        networkState: audioRef.current.networkState,
        readyState: audioRef.current.readyState
      });
    });
    
    // Cleanup
    return () => {
      console.log('[OggStreamPlayer] 🧹 Cleaning up MediaSource');
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current = null;
      }
      mediaSourceRef.current = null;
      sourceBufferRef.current = null;
      queueRef.current = [];
      chunkCountRef.current = 0;
    };
  }, []);

  // Append Ogg/Opus chunk to MediaSource
  const appendChunk = (chunk) => {
    chunkCountRef.current++;
    console.log(`[OggStreamPlayer] 📦 appendChunk #${chunkCountRef.current} called`);
    console.log('[OggStreamPlayer] Chunk details:', {
      size: chunk?.byteLength,
      type: typeof chunk,
      isArrayBuffer: chunk instanceof ArrayBuffer,
      isUint8Array: chunk instanceof Uint8Array,
      mediaSourceReady,
      sourceBufferExists: !!sourceBufferRef.current,
      sourceBufferUpdating: sourceBufferRef.current?.updating,
      queueLength: queueRef.current.length
    });
    
    if (!chunk || chunk.byteLength === 0) {
      console.warn('[OggStreamPlayer] ⚠️ Empty or invalid chunk received');
      return;
    }
    
    if (mediaSourceReady && sourceBufferRef.current && !sourceBufferRef.current.updating) {
      try {
        const uint8Array = new Uint8Array(chunk);
        sourceBufferRef.current.appendBuffer(uint8Array);
        console.log(`[OggStreamPlayer] ✅ Appended chunk #${chunkCountRef.current} to SourceBuffer (${uint8Array.length} bytes)`);
      } catch (e) {
        console.error(`[OggStreamPlayer] ❌ Error appending chunk #${chunkCountRef.current}:`, e);
        // If buffer is updating, queue the chunk
        queueRef.current.push(new Uint8Array(chunk));
        console.log('[OggStreamPlayer] Chunk queued due to append error, queue length:', queueRef.current.length);
      }
    } else {
      // If not ready, queue the chunk
      queueRef.current.push(new Uint8Array(chunk));
      console.log(`[OggStreamPlayer] 📋 Chunk #${chunkCountRef.current} queued (not ready or updating), queue length:`, queueRef.current.length);
      console.log('[OggStreamPlayer] Queue reason:', {
        mediaSourceReady,
        sourceBufferExists: !!sourceBufferRef.current,
        sourceBufferUpdating: sourceBufferRef.current?.updating
      });
    }
  };

  return { audioRef, appendChunk };
}

// Animated visual feedback for states
function BubbleWave({ active, color }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-full border-2"
      animate={active ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 0.3 }}
      transition={{ duration: 1.2, repeat: active ? Infinity : 0, ease: "easeInOut" }}
      style={{ borderColor: color || '#6366f1' }}
    />
  );
}

export default function AIBubble() {
  const [isMounted, setIsMounted] = useState(false);
  const { audioRef, appendChunk } = useOggStreamPlayer();

  // Only render on client side to avoid hydration issues
  useEffect(() => {
    console.log('[AIBubble] 🚀 Component mounting on client side');
    setIsMounted(true);
  }, []);

  // Connect to our local proxy server via WebSocket
  console.log('[AIBubble] 🔌 Initializing OpenAI Realtime connection');
  const realtime = useOpenAIRealtime({
    apiKey: 'proxy', // Not used by proxy
    clientSecret: 'proxy', // Not used by proxy
    realtimeUrl: 'ws://localhost:3002', // WebSocket endpoint
    onAudioChunk: (chunk) => {
      console.log('[AIBubble] 🎵 Received audio chunk from OpenAI, forwarding to player');
      appendChunk(chunk);
    },
  });

  const {
    isConnected,
    isConnecting,
    isListening,
    isSpeaking,
    connectionError,
    startListening,
    stopListening,
    connect,
    disconnect,
  } = realtime;

  // Log state changes
  useEffect(() => {
    console.log('[AIBubble] 🔄 State changed:', {
      isConnected,
      isConnecting,
      isListening,
      isSpeaking,
      hasError: !!connectionError
    });
  }, [isConnected, isConnecting, isListening, isSpeaking, connectionError]);

  // Determine bubble color and state
  let bubbleColor = '#22c55e'; // green
  let stateLabel = '';
  if (connectionError) {
    bubbleColor = '#ef4444'; // red
    stateLabel = 'Error';
  } else if (isConnecting) {
    bubbleColor = '#f59e42'; // orange
    stateLabel = 'Connecting';
  } else if (isListening) {
    bubbleColor = '#6366f1'; // indigo
    stateLabel = 'Listening';
  } else if (isSpeaking) {
    bubbleColor = '#0ea5e9'; // blue
    stateLabel = 'Speaking';
  } else if (isConnected) {
    bubbleColor = '#22c55e'; // green
    stateLabel = 'Ready';
  } else {
    bubbleColor = '#a1a1aa'; // gray
    stateLabel = 'Disconnected';
  }

  // Bubble click handler
  const handleClick = () => {
    console.log('[AIBubble] 🖱️ Bubble clicked, current state:', {
      isConnected,
      isConnecting,
      isListening,
      stateLabel
    });
    
    if (!isConnected && !isConnecting) {
      console.log('[AIBubble] 🔌 Initiating connection...');
      connect();
    } else if (isListening) {
      console.log('[AIBubble] 🛑 Stopping listening...');
      stopListening();
    } else {
      console.log('[AIBubble] 🎤 Starting listening...');
      startListening();
    }
  };

  // Don't render until mounted on client
  if (!isMounted) {
    console.log('[AIBubble] ⏳ Waiting for client-side mount...');
    return null;
  }

  console.log('[AIBubble] 🎨 Rendering bubble with state:', stateLabel);

  return (
    <div className="fixed top-8 right-8 z-50">
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
      <motion.button
        initial={false}
        animate={{
          scale: isListening || isSpeaking ? 1.1 : 1,
          boxShadow: isListening || isSpeaking
            ? `0 0 0 20px ${bubbleColor}33, 0 8px 32px ${bubbleColor}55`
            : `0 4px 20px #0002`,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.3 }}
        className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2"
        style={{ background: bubbleColor, borderColor: bubbleColor, outline: "none" }}
        aria-label={stateLabel}
        onClick={handleClick}
      >
        {/* Animated wave */}
        <BubbleWave active={isListening || isSpeaking} color={bubbleColor} />
        {/* Mic or speaker icon */}
        <motion.div
          animate={{ scale: isListening || isSpeaking ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 1.2, repeat: isListening || isSpeaking ? Infinity : 0, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center"
        >
          {isListening ? (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="12" y="4" width="4" height="12" rx="2" fill="#fff"/><rect x="8" y="18" width="12" height="4" rx="2" fill="#fff"/></svg>
          ) : isSpeaking ? (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="8" fill="#fff"/></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="#fff" strokeWidth="2" fill="none"/><rect x="12" y="8" width="4" height="8" rx="2" fill="#fff"/></svg>
          )}
        </motion.div>
      </motion.button>
      {/* State indicator (no text except error) */}
      <AnimatePresence>
        {connectionError && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-red-500/90 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm border border-red-300/20 max-w-[200px] text-center"
          >
            {connectionError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 