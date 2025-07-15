# Deepgram Voice Agent Troubleshooting Guide

## 🚨 **Robot Voice Issue - Root Causes & Solutions**

### **Primary Issue: Audio Format Mismatch**

**Problem**: Inconsistent sample rates between input and output audio streams.

**Symptoms**:
- AI responses sound robotic or distorted
- Audio quality is poor
- Intermittent audio playback

**Solution**: Use consistent 16kHz sample rate for both input and output.

```javascript
// ✅ CORRECT - Consistent sample rates
audio: {
  input: {
    encoding: "linear16",
    sample_rate: 16000  // 16kHz input
  },
  output: {
    encoding: "linear16", 
    sample_rate: 16000,  // 16kHz output
    container: "wav"
  }
}

// ❌ WRONG - Mismatched sample rates
audio: {
  input: {
    encoding: "linear16",
    sample_rate: 24000  // 24kHz input
  },
  output: {
    encoding: "linear16", 
    sample_rate: 16000,  // 16kHz output - MISMATCH!
    container: "wav"
  }
}
```

### **Secondary Issue: Audio Context Management**

**Problem**: Creating new AudioContext for each audio chunk causes glitches.

**Symptoms**:
- Audio stuttering
- Robot-like voice quality
- Audio context errors in console

**Solution**: Use persistent AudioContext with proper queue management.

```javascript
// ✅ CORRECT - Persistent audio context
const audioContextRef = useRef(null);

const initializeAudioContext = useCallback(() => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    // Resume if suspended (required for Chrome)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }
  return audioContextRef.current;
}, []);
```

### **Tertiary Issue: Audio Queue Management**

**Problem**: Multiple audio chunks playing simultaneously cause overlapping.

**Symptoms**:
- Echo effects
- Distorted audio
- Inconsistent playback

**Solution**: Sequential audio playback with proper queue management.

```javascript
// ✅ CORRECT - Sequential audio queue
const audioQueueRef = useRef([]);
const isPlayingRef = useRef(false);

const playAudioQueue = useCallback(async () => {
  if (isPlayingRef.current || audioQueueRef.current.length === 0) {
    return;
  }

  isPlayingRef.current = true;
  
  while (audioQueueRef.current.length > 0) {
    const pcmData = audioQueueRef.current.shift();
    // Process and play audio chunk
    await playAudioChunk(pcmData);
  }
  
  isPlayingRef.current = false;
}, []);
```

## 🔧 **Step-by-Step Diagnostic Process**

### **1. Run Browser Diagnostics**

Use the enhanced test page at `/test-deepgram`:

1. Click "Run Diagnostics"
2. Check all system compatibility indicators
3. Verify microphone access and settings
4. Confirm API key is present

### **2. Check Browser Console**

Look for these specific error patterns:

```javascript
// ✅ Good - Normal operation
[DeepgramAgent] 🔊 Audio context initialized: {sampleRate: 48000, state: "running"}
[DeepgramAgent] 🔊 Playing audio chunk: {duration: 0.5, samples: 8000, sampleRate: 16000}

// ❌ Bad - Audio context issues
[DeepgramAgent] ❌ Audio Context Error: The AudioContext was not allowed to start
[DeepgramAgent] ❌ Audio playback error: Failed to execute 'start' on 'AudioBufferSourceNode'

// ❌ Bad - Sample rate mismatch
[DeepgramAgent] 🎤 Resampling from 48000 to 16000 Hz
[DeepgramAgent] 🎤 Sample rates don't match, will resample audio
```

### **3. Verify Audio Settings**

Check your microphone and browser audio settings:

```javascript
// Run this in browser console to check audio capabilities
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const track = stream.getAudioTracks()[0];
    const settings = track.getSettings();
    console.log('Audio Settings:', settings);
    stream.getTracks().forEach(track => track.stop());
  });
```

**Expected Output**:
```javascript
{
  sampleRate: 48000,        // Browser default
  channelCount: 1,          // Mono
  echoCancellation: true,   // Should be enabled
  noiseSuppression: true,   // Should be enabled
  autoGainControl: true     // Should be enabled
}
```

## 🛠 **Common Fixes**

### **Fix 1: Audio Context Suspension (Chrome)**

**Problem**: Chrome suspends AudioContext until user interaction.

**Solution**: Resume audio context on user interaction.

```javascript
// Add this to your component
useEffect(() => {
  const resumeAudioContext = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  document.addEventListener('click', resumeAudioContext);
  document.addEventListener('touchstart', resumeAudioContext);
  
  return () => {
    document.removeEventListener('click', resumeAudioContext);
    document.removeEventListener('touchstart', resumeAudioContext);
  };
}, []);
```

### **Fix 2: Sample Rate Resampling**

**Problem**: Browser provides 48kHz but Deepgram expects 16kHz.

**Solution**: Proper resampling algorithm.

```javascript
// ✅ CORRECT - Linear interpolation resampling
const resampleAudio = (inputData, inputSampleRate, targetSampleRate) => {
  const ratio = targetSampleRate / inputSampleRate;
  const newLength = Math.round(inputData.length * ratio);
  const resampledData = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const oldIndex = i / ratio;
    const index1 = Math.floor(oldIndex);
    const index2 = Math.min(index1 + 1, inputData.length - 1);
    const fraction = oldIndex - index1;
    resampledData[i] = inputData[index1] * (1 - fraction) + inputData[index2] * fraction;
  }
  
  return resampledData;
};
```

### **Fix 3: PCM Conversion**

**Problem**: Incorrect conversion between audio formats.

**Solution**: Proper Int16 to Float32 conversion.

```javascript
// ✅ CORRECT - Proper PCM conversion
const convertToPCM = (floatData) => {
  const pcmData = new Int16Array(floatData.length);
  for (let i = 0; i < floatData.length; i++) {
    // Clamp to [-1, 1] range and convert to Int16
    const sample = Math.max(-1, Math.min(1, floatData[i]));
    pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
  }
  return pcmData;
};

const convertFromPCM = (pcmData) => {
  const floatData = new Float32Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    floatData[i] = pcmData[i] / 32768.0;
  }
  return floatData;
};
```

## 🎯 **Deepgram-Specific Best Practices**

### **1. Voice Model Selection**

Use high-quality voice models for better audio:

```javascript
speak: {
  provider: {
    type: "deepgram",
    model: "aura-2-thalia-en"  // High-quality voice
    // Alternative: "aura-2-asteria-en", "aura-2-stella-en"
  }
}
```

### **2. Audio Configuration**

Optimal settings for voice quality:

```javascript
audio: {
  input: {
    encoding: "linear16",
    sample_rate: 16000
  },
  output: {
    encoding: "linear16", 
    sample_rate: 16000,
    container: "wav"  // Better quality than raw PCM
  }
}
```

### **3. Error Handling**

Proper error handling for production:

```javascript
ws.onerror = (error) => {
  console.error('[DeepgramAgent] ❌ WebSocket error:', error);
  setError(`Connection error: ${error.message}`);
  // Implement retry logic here
};

ws.onclose = (event) => {
  if (!event.wasClean) {
    console.error('[DeepgramAgent] ❌ Connection closed abnormally');
    // Implement reconnection logic here
  }
};
```

## 🔍 **Debugging Checklist**

### **Before Testing**:
- [ ] Environment variable `DEEPGRAM_API_KEY` is set
- [ ] Using HTTPS or localhost (required for microphone)
- [ ] Browser supports Web Audio API
- [ ] Microphone permissions granted

### **During Testing**:
- [ ] Check browser console for errors
- [ ] Verify WebSocket connection status
- [ ] Monitor audio processing logs
- [ ] Test with different voice models

### **After Testing**:
- [ ] Review all console logs
- [ ] Check network tab for API calls
- [ ] Verify audio format consistency
- [ ] Test on different browsers

## 🚀 **Performance Optimization**

### **1. Audio Buffer Size**

Optimize for your use case:

```javascript
// For real-time: Smaller buffers, lower latency
const processor = audioContext.createScriptProcessor(2048, 1, 1);

// For quality: Larger buffers, better performance
const processor = audioContext.createScriptProcessor(8192, 1, 1);
```

### **2. Memory Management**

Prevent memory leaks:

```javascript
// Clean up resources properly
useEffect(() => {
  return () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    audioQueueRef.current = [];
  };
}, []);
```

## 📞 **Getting Help**

If you're still experiencing issues:

1. **Run Diagnostics**: Use the enhanced test page
2. **Check Logs**: Review browser console thoroughly
3. **Test Environment**: Verify API key and permissions
4. **Browser Test**: Try Chrome/Edge for best compatibility
5. **Network Check**: Ensure stable internet connection

### **Common Error Messages**:

- `"AudioContext was not allowed to start"` → User interaction required
- `"Failed to execute 'start'"` → Audio context suspended
- `"WebSocket connection failed"` → Check API key and network
- `"Microphone access denied"` → Check browser permissions

---

**Remember**: The key to fixing robot voice issues is ensuring consistent audio formats, proper audio context management, and sequential audio playback. The enhanced implementation should resolve most common issues. 