"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeepgramAgent } from "../hooks/useDeepgramAgent";

// Animated concentric circles for the pulse effect
function PulseCircles({ active }) {
  return (
    <div className="absolute inset-0">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={active ? {
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          } : {
            scale: 1,
            opacity: 0,
          }}
          transition={{
            duration: 2,
            repeat: active ? Infinity : 0,
            delay: i * 0.4,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

// Animated sound waves for when active
function SoundWaves({ active, intensity = 1 }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 bg-white rounded-full"
          animate={active ? {
            height: [4, 20 * intensity, 4],
            opacity: [0.3, 1, 0.3],
          } : {
            height: 4,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            repeat: active ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          style={{
            left: `${50 + (i - 3.5) * 8}%`,
            transform: 'translateX(-50%)'
          }}
        />
      ))}
    </div>
  );
}

// Processing spinner
function ProcessingSpinner({ active }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={active ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
        animate={active ? { rotate: 360 } : { rotate: 0 }}
        transition={{
          duration: 1,
          repeat: active ? Infinity : 0,
          ease: "linear"
        }}
      />
    </motion.div>
  );
}

// Microphone icon for inactive state
function MicrophoneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
      <path
        d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
        fill="currentColor"
      />
      <path
        d="M19 10v2a7 7 0 0 1-14 0v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="12"
        y1="19"
        x2="12"
        y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="8"
        y1="23"
        x2="16"
        y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Speaking indicator
function SpeakingIndicator({ active }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={active ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
        <motion.div
          className="w-3 h-3 rounded-full bg-white"
          animate={active ? {
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          } : {
            scale: 1,
            opacity: 1
          }}
          transition={{
            duration: 0.8,
            repeat: active ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}

export default function AIBubble() {
  const {
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
  } = useDeepgramAgent();

  const isActive = isListening || isProcessing || isSpeaking;

  return (
    <div className="fixed top-8 right-8 z-50">
      {/* Main bubble */}
      <motion.button
        initial={false}
        animate={isActive ? { 
          scale: 1.1,
          boxShadow: "0 0 0 20px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)"
        } : { 
          scale: 1,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.3
        }}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-2 border-white/20 ${
          error ? 'bg-gradient-to-br from-red-400 to-red-600' :
          isConnecting ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
          isActive ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
          'bg-gradient-to-br from-green-400 to-green-600'
        }`}
        aria-label={isActive ? "AI Voice Agent active" : "Activate AI Voice Agent"}
        onClick={toggleListening}
        style={{ outline: "none" }}
      >
        {/* Pulse circles */}
        <PulseCircles active={isListening} />
        
        {/* Sound waves when listening */}
        <SoundWaves active={isListening} intensity={1} />
        
        {/* Processing spinner */}
        <ProcessingSpinner active={isProcessing} />
        
        {/* Speaking indicator */}
        <SpeakingIndicator active={isSpeaking} />
        
        {/* Connecting indicator */}
        <ProcessingSpinner active={isConnecting} />
        
        {/* Icon - only show when not in other states */}
        {!isListening && !isProcessing && !isSpeaking && !isConnecting && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="relative z-10 flex items-center justify-center"
          >
            <MicrophoneIcon />
          </motion.div>
        )}
      </motion.button>

      {/* Status indicator */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-black/80 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm border border-white/20 min-w-[120px] text-center"
          >
            <div className="flex items-center justify-center gap-2">
              {isListening && (
                <>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-white rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                  Listening...
                </>
              )}
              {isProcessing && (
                <>
                  <motion.div
                    className="w-3 h-3 border border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  Thinking...
                </>
              )}
              {isSpeaking && (
                <>
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  Speaking...
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error indicator */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-red-500/90 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm border border-red-300/20 max-w-[200px] text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation display (optional - for debugging) */}
      {(transcript || response) && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-0 right-20 w-64 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20"
        >
          {transcript && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">You said:</div>
              <div className="text-sm text-gray-800">{transcript}</div>
            </div>
          )}
          {response && (
            <div>
              <div className="text-xs text-gray-500 mb-1">AI Response:</div>
              <div className="text-sm text-gray-800">{response}</div>
            </div>
          )}
          <button
            onClick={clearConversation}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        </motion.div>
      )}
    </div>
  );
} 