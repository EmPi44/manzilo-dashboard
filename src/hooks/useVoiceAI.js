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

  // Helper: Split text into sentences (simple regex)
  function splitSentences(text) {
    // This regex splits on . ! ? followed by a space or end of string
    return text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [];
  }

  // Queue for TTS sentences
  const ttsQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  // Play next sentence in the queue
  const playNextTTS = async () => {
    if (isPlayingRef.current || ttsQueueRef.current.length === 0) return;
    isPlayingRef.current = true;
    const sentence = ttsQueueRef.current.shift();
    try {
      await speakResponse(sentence);
    } finally {
      isPlayingRef.current = false;
      if (ttsQueueRef.current.length > 0) {
        playNextTTS();
      }
    }
  };

  // Process voice input with OpenAI (streaming, sentence-by-sentence TTS)
  const processVoiceInput = async (text) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setError('');
    setResponse('');
    ttsQueueRef.current = [];
    isPlayingRef.current = false;

    try {
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

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let aiText = '';
      let buffer = '';
      setResponse('');

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          chunk.split(/\n/).forEach(line => {
            if (line.startsWith('data:')) {
              const data = line.replace('data:', '').trim();
              if (data && data !== '[DONE]') {
                try {
                  const json = JSON.parse(data);
                  const content = json.choices?.[0]?.delta?.content;
                  if (content) {
                    aiText += content;
                    setResponse(prev => prev + content);
                    buffer += content;
                    // Check for complete sentences
                    const sentences = splitSentences(buffer);
                    // All but the last are complete
                    for (let i = 0; i < sentences.length - 1; i++) {
                      ttsQueueRef.current.push(sentences[i].trim());
                    }
                    // The last may be incomplete, keep it in buffer
                    buffer = sentences.length > 0 ? sentences[sentences.length - 1] : '';
                    // Start playing if not already
                    if (!isPlayingRef.current && ttsQueueRef.current.length > 0) {
                      playNextTTS();
                    }
                  }
                } catch (e) {
                  // ignore JSON parse errors
                }
              }
            }
          });
        }
      }
      // After stream ends, flush any remaining buffer as a sentence
      if (buffer.trim()) {
        ttsQueueRef.current.push(buffer.trim());
        if (!isPlayingRef.current) {
          playNextTTS();
        }
      }

    } catch (err) {
      console.error('Error processing voice input:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-speech functionality using OpenAI TTS
  const speakResponse = async (text) => {
    if (!text) return;
    setIsSpeaking(true);
    try {
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'onyx' }),
      });
      if (!ttsRes.ok) throw new Error('TTS API error');
      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play();
    } catch (err) {
      setIsSpeaking(false);
      setError('Failed to play AI voice response');
      console.error('TTS error:', err);
    }
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
      // No longer needed as speechSynthesis is removed
      // speechSynthesis.cancel(); 
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