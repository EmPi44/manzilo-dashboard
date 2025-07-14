"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
function SoundWaves({ active }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 bg-white rounded-full"
          animate={active ? {
            height: [4, 20, 4],
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

export default function AIBubble() {
  const [active, setActive] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Main bubble */}
      <motion.button
        initial={false}
        animate={active ? { 
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
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center cursor-pointer border-2 border-white/20"
        aria-label={active ? "AI Voice Agent active" : "Activate AI Voice Agent"}
        onClick={() => setActive((a) => !a)}
        style={{ outline: "none" }}
      >
        {/* Pulse circles */}
        <PulseCircles active={active} />
        
        {/* Sound waves when active */}
        <SoundWaves active={active} />
        
        {/* Icon */}
        <motion.div
          animate={active ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : { 
            scale: 1,
            rotate: 0
          }}
          transition={active ? { 
            repeat: Infinity, 
            duration: 1.5, 
            ease: "easeInOut" 
          } : {
            duration: 0.3
          }}
          className="relative z-10 flex items-center justify-center"
        >
          {active ? (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
          ) : (
            <MicrophoneIcon />
          )}
        </motion.div>
      </motion.button>

      {/* Status indicator */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-black/80 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm border border-white/20"
          >
            <div className="flex items-center gap-2">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 