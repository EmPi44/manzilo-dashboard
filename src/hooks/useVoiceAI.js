"use client";

import { useState, useRef, useCallback } from 'react';

export const useVoiceAI = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
      finalTranscriptRef.current = '';
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript || interimTranscript;
      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (finalTranscriptRef.current.trim()) {
        processVoiceInput(finalTranscriptRef.current);
      }
    };

    return true;
  }, []);

  // Process voice input with OpenAI
  const processVoiceInput = async (text) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setError('');

    try {
      // First, convert speech to text using Whisper (if needed)
      // For now, we'll use the text directly from speech recognition
      
      // Call OpenAI GPT-4 for response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          context: 'You are a helpful AI assistant for a property management dashboard. Help users with building management, tenant issues, maintenance requests, and data analysis.'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data.response);
      
      // Optional: Convert response to speech
      if (data.response) {
        speakResponse(data.response);
      }

    } catch (err) {
      console.error('Error processing voice input:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-speech functionality
  const speakResponse = (text) => {
    if (!text || !('speechSynthesis' in window)) return;

    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  // Start listening
  const startListening = useCallback(() => {
    if (isListening || isProcessing) return;
    
    if (!recognitionRef.current && !initializeSpeechRecognition()) {
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start voice recognition');
    }
  }, [isListening, isProcessing, initializeSpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isListening, isSpeaking]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setTranscript('');
    setResponse('');
    setError('');
  }, []);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    response,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearConversation,
  };
}; 