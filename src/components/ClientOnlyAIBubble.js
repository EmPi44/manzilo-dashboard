"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import AIBubble with no SSR
const AIBubble = dynamic(() => import('./AIBubble'), {
  ssr: false,
  loading: () => (
    <div className="fixed top-8 right-8 z-50 w-16 h-16 rounded-full bg-gray-300 animate-pulse" />
  ),
});

export default function ClientOnlyAIBubble() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until mounted
  if (!isMounted) {
    return null;
  }

  return <AIBubble />;
} 