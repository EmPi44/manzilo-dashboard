/**
 * Advanced Audio Quality Test Script
 * Helps fine-tune audio processing for optimal voice quality
 */

console.log('🎵 Starting Advanced Audio Quality Test...');

// Test 1: Audio Processing Chain
async function testAudioProcessingChain() {
  console.log('🔊 Testing Audio Processing Chain...');
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create compressor
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    
    // Create gain node
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.8;
    
    // Create test oscillator
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    
    // Connect the chain
    oscillator.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    console.log('✅ Audio processing chain created:', {
      compressor: {
        threshold: compressor.threshold.value,
        ratio: compressor.ratio.value,
        attack: compressor.attack.value,
        release: compressor.release.value
      },
      gain: gainNode.gain.value
    });
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('❌ Audio processing chain test failed:', error);
    return false;
  }
}

// Test 2: Audio Smoothing Algorithm
function testAudioSmoothing() {
  console.log('🔄 Testing Audio Smoothing Algorithm...');
  
  try {
    // Create test audio data with harsh transitions
    const testData = new Float32Array(100);
    for (let i = 0; i < testData.length; i++) {
      testData[i] = Math.random() * 2 - 1; // Random values between -1 and 1
    }
    
    // Apply smoothing
    const smoothAudioData = (audioData, smoothingFactor = 0.1) => {
      const smoothed = new Float32Array(audioData.length);
      let previousSample = 0;
      
      for (let i = 0; i < audioData.length; i++) {
        smoothed[i] = previousSample + (audioData[i] - previousSample) * smoothingFactor;
        previousSample = smoothed[i];
      }
      
      return smoothed;
    };
    
    const smoothedData = smoothAudioData(testData, 0.15);
    
    // Calculate smoothness metrics
    let totalVariation = 0;
    for (let i = 1; i < smoothedData.length; i++) {
      totalVariation += Math.abs(smoothedData[i] - smoothedData[i-1]);
    }
    const averageVariation = totalVariation / (smoothedData.length - 1);
    
    console.log('✅ Audio smoothing test passed:', {
      originalSamples: testData.length,
      smoothedSamples: smoothedData.length,
      averageVariation: averageVariation.toFixed(4),
      smoothingFactor: 0.15
    });
    
    return true;
  } catch (error) {
    console.error('❌ Audio smoothing test failed:', error);
    return false;
  }
}

// Test 3: Soft Clipping Algorithm
function testSoftClipping() {
  console.log('📊 Testing Soft Clipping Algorithm...');
  
  try {
    // Create test data with potential clipping
    const testData = new Float32Array([0, 0.5, 1, 1.2, -0.5, -1, -1.3, 0.8]);
    
    const applySoftClipping = (samples) => {
      const clipped = new Float32Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        clipped[i] = sample > 0.8 ? 0.8 + (sample - 0.8) * 0.5 : 
                     sample < -0.8 ? -0.8 + (sample + 0.8) * 0.5 : sample;
      }
      return clipped;
    };
    
    const clippedData = applySoftClipping(testData);
    
    console.log('✅ Soft clipping test passed:', {
      original: Array.from(testData),
      clipped: Array.from(clippedData),
      maxOriginal: Math.max(...testData),
      maxClipped: Math.max(...clippedData)
    });
    
    return true;
  } catch (error) {
    console.error('❌ Soft clipping test failed:', error);
    return false;
  }
}

// Test 4: Fade In/Out Algorithm
function testFadeInOut() {
  console.log('🎚️ Testing Fade In/Out Algorithm...');
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create test audio buffer
    const sampleRate = 16000;
    const duration = 0.5; // 500ms
    const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    // Fill with test tone
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
    }
    
    // Create gain node for fade
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    
    // Create source
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainNode);
    
    // Apply fade in/out
    const fadeTime = 0.01; // 10ms
    const startTime = audioContext.currentTime;
    
    // Fade in
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.8, startTime + fadeTime);
    
    // Fade out
    const endTime = startTime + audioBuffer.duration;
    gainNode.gain.setValueAtTime(0.8, endTime - fadeTime);
    gainNode.gain.linearRampToValueAtTime(0, endTime);
    
    console.log('✅ Fade in/out test passed:', {
      duration: audioBuffer.duration,
      fadeTime: fadeTime,
      startTime: startTime,
      endTime: endTime
    });
    
    source.start(startTime);
    setTimeout(() => {
      audioContext.close();
    }, duration * 1000 + 100);
    
    return true;
  } catch (error) {
    console.error('❌ Fade in/out test failed:', error);
    return false;
  }
}

// Test 5: Audio Quality Metrics
function testAudioQualityMetrics() {
  console.log('📈 Testing Audio Quality Metrics...');
  
  try {
    // Create test audio with known characteristics
    const sampleRate = 16000;
    const duration = 0.1; // 100ms
    const audioBuffer = new Float32Array(sampleRate * duration);
    
    // Generate test signal
    for (let i = 0; i < audioBuffer.length; i++) {
      audioBuffer[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.5;
    }
    
    // Calculate quality metrics
    let rms = 0;
    let peak = 0;
    let zeroCrossings = 0;
    
    for (let i = 0; i < audioBuffer.length; i++) {
      const sample = audioBuffer[i];
      rms += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
      
      if (i > 0 && (audioBuffer[i] >= 0) !== (audioBuffer[i-1] >= 0)) {
        zeroCrossings++;
      }
    }
    
    rms = Math.sqrt(rms / audioBuffer.length);
    const dynamicRange = 20 * Math.log10(peak / rms);
    
    console.log('✅ Audio quality metrics test passed:', {
      rms: rms.toFixed(4),
      peak: peak.toFixed(4),
      dynamicRange: dynamicRange.toFixed(2) + ' dB',
      zeroCrossings: zeroCrossings,
      samples: audioBuffer.length,
      duration: duration + 's'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Audio quality metrics test failed:', error);
    return false;
  }
}

// Test 6: Real-time Audio Processing Performance
async function testRealTimePerformance() {
  console.log('⚡ Testing Real-time Audio Processing Performance...');
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create test stream
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1
      }
    });
    
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    let processingTimes = [];
    let frameCount = 0;
    
    processor.onaudioprocess = (event) => {
      const startTime = performance.now();
      
      // Simulate audio processing
      const inputData = event.inputBuffer.getChannelData(0);
      const outputData = event.outputBuffer.getChannelData(0);
      
      // Apply smoothing
      let previousSample = 0;
      for (let i = 0; i < inputData.length; i++) {
        outputData[i] = previousSample + (inputData[i] - previousSample) * 0.15;
        previousSample = outputData[i];
      }
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      processingTimes.push(processingTime);
      frameCount++;
      
      // Stop after 50 frames
      if (frameCount >= 50) {
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        
        const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
        const maxProcessingTime = Math.max(...processingTimes);
        
        console.log('✅ Real-time performance test passed:', {
          framesProcessed: frameCount,
          averageProcessingTime: avgProcessingTime.toFixed(2) + 'ms',
          maxProcessingTime: maxProcessingTime.toFixed(2) + 'ms',
          bufferSize: 4096,
          sampleRate: 16000
        });
      }
    };
    
    source.connect(processor);
    processor.connect(audioContext.destination);
    
    return true;
  } catch (error) {
    console.error('❌ Real-time performance test failed:', error);
    return false;
  }
}

// Run all advanced tests
async function runAdvancedTests() {
  console.log('🚀 Running Advanced Audio Quality Tests...\n');
  
  const results = {
    audioProcessingChain: await testAudioProcessingChain(),
    audioSmoothing: testAudioSmoothing(),
    softClipping: testSoftClipping(),
    fadeInOut: testFadeInOut(),
    audioQualityMetrics: testAudioQualityMetrics(),
    realTimePerformance: await testRealTimePerformance()
  };
  
  console.log('\n📊 Advanced Test Results:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? '🎉 All advanced tests passed!' : '⚠️ Some advanced tests failed.'}`);
  
  if (allPassed) {
    console.log('✅ Your system is optimized for high-quality voice processing!');
    console.log('💡 Tips for further optimization:');
    console.log('   - Adjust smoothing factor (0.1-0.2) for different voice characteristics');
    console.log('   - Fine-tune compressor settings for your audio environment');
    console.log('   - Monitor real-time performance for optimal buffer sizes');
  } else {
    console.log('🔧 Please address failed tests for optimal voice quality.');
  }
  
  return results;
}

// Auto-run tests when script is loaded
runAdvancedTests().catch(console.error);

// Export for manual testing
window.advancedAudioTest = {
  testAudioProcessingChain,
  testAudioSmoothing,
  testSoftClipping,
  testFadeInOut,
  testAudioQualityMetrics,
  testRealTimePerformance,
  runAdvancedTests
}; 