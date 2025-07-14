"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simple animated waveform SVG
function Waveform({ active }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y={active ? 10 : 14} width="3" height={active ? 8 : 4} rx="1.5" fill="#6366f1"/>
      <rect x="9" y={active ? 6 : 14} width="3" height={active ? 16 : 4} rx="1.5" fill="#6366f1"/>
      <rect x="14" y={active ? 2 : 14} width="3" height={active ? 24 : 4} rx="1.5" fill="#6366f1"/>
      <rect x="19" y={active ? 6 : 14} width="3" height={active ? 16 : 4} rx="1.5" fill="#6366f1"/>
      <rect x="24" y={active ? 10 : 14} width="3" height={active ? 8 : 4} rx="1.5" fill="#6366f1"/>
    </svg>
  );
}

export default function AIBubble() {
  const [active, setActive] = useState(false);

  return (
    <motion.button
      initial={false}
      animate={active ? { boxShadow: "0 0 0 8px #6366f133, 0 2px 8px #6366f1aa", scale: 1.08 } : { boxShadow: "0 2px 8px #6366f144", scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="fixed top-6 right-8 z-50 w-14 h-14 rounded-full bg-white border-2 border-indigo-400 flex items-center justify-center cursor-pointer"
      aria-label={active ? "AI Voice Agent active" : "Activate AI Voice Agent"}
      onClick={() => setActive((a) => !a)}
      style={{ outline: "none" }}
    >
      <motion.div
        animate={active ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1, 1.05, 1] } : { rotate: 0, scale: 1 }}
        transition={active ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : {}}
        className="flex items-center justify-center"
      >
        <Waveform active={active} />
      </motion.div>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded shadow-lg"
          >
            Listening…
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
} 