/**
 * Voice Quality Test Script
 * Run this in browser console to test audio processing
 */

console.log('🎵 Starting Voice Quality Test...');

// Test 1: Audio Context
async function testAudioContext() {
  console.log('🔊 Testing Audio Context...');
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('✅ Audio Context created:', {
      sampleRate: audioContext.sampleRate,
      state: audioContext.state,
      baseLatency: audioContext.baseLatency
    });
    
    if (audioContext.state === 'suspended') {
      console.log('⚠️ Audio Context suspended, resuming...');
      await audioContext.resume();
      console.log('✅ Audio Context resumed:', audioContext.state);
    }
    
    audioContext.close();
    return true;
  } catch (error) {
    console.error('❌ Audio Context test failed:', error);
    return false;
  }
}

// Test 2: Microphone Access
async function testMicrophone() {
  console.log('🎤 Testing Microphone Access...');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    const track = stream.getAudioTracks()[0];
    const settings = track.getSettings();
    
    console.log('✅ Microphone access granted:', {
      sampleRate: settings.sampleRate,
      channelCount: settings.channelCount,
      deviceId: settings.deviceId,
      groupId: settings.groupId,
      label: track.label
    });
    
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('❌ Microphone test failed:', error);
    return false;
  }
}

// Test 3: Audio Processing
async function testAudioProcessing() {
  console.log('🎵 Testing Audio Processing...');
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a simple test tone
    const sampleRate = 16000;
    const duration = 0.1; // 100ms
    const frequency = 440; // A4 note
    
    const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }
    
    // Convert to PCM
    const pcmData = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      pcmData[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
    }
    
    console.log('✅ Audio processing test passed:', {
      originalSamples: channelData.length,
      pcmSamples: pcmData.length,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate
    });
    
    audioContext.close();
    return true;
  } catch (error) {
    console.error('❌ Audio processing test failed:', error);
    return false;
  }
}

// Test 4: PCM Conversion
function testPCMConversion() {
  console.log('🔄 Testing PCM Conversion...');
  
  try {
    // Test Float32 to Int16 conversion
    const floatData = new Float32Array([0, 0.5, 1, -0.5, -1]);
    const pcmData = new Int16Array(floatData.length);
    
    for (let i = 0; i < floatData.length; i++) {
      const sample = Math.max(-1, Math.min(1, floatData[i]));
      pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    // Test Int16 to Float32 conversion
    const backToFloat = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      backToFloat[i] = pcmData[i] / 32768.0;
    }
    
    console.log('✅ PCM conversion test passed:', {
      original: Array.from(floatData),
      pcm: Array.from(pcmData),
      converted: Array.from(backToFloat)
    });
    
    return true;
  } catch (error) {
    console.error('❌ PCM conversion test failed:', error);
    return false;
  }
}

// Test 5: Sample Rate Resampling
function testResampling() {
  console.log('📊 Testing Sample Rate Resampling...');
  
  try {
    const inputData = new Float32Array([0, 0.5, 1, 0.5, 0, -0.5, -1, -0.5]);
    const inputSampleRate = 48000;
    const targetSampleRate = 16000;
    
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
    
    console.log('✅ Resampling test passed:', {
      originalLength: inputData.length,
      resampledLength: resampledData.length,
      ratio: ratio,
      originalSampleRate: inputSampleRate,
      targetSampleRate: targetSampleRate
    });
    
    return true;
  } catch (error) {
    console.error('❌ Resampling test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running Voice Quality Tests...\n');
  
  const results = {
    audioContext: await testAudioContext(),
    microphone: await testMicrophone(),
    audioProcessing: await testAudioProcessing(),
    pcmConversion: testPCMConversion(),
    resampling: testResampling()
  };
  
  console.log('\n📊 Test Results:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed. Check the issues above.'}`);
  
  if (allPassed) {
    console.log('✅ Your system is ready for high-quality voice processing!');
  } else {
    console.log('🔧 Please fix the failed tests before using voice features.');
  }
  
  return results;
}

// Auto-run tests when script is loaded
runAllTests().catch(console.error);

// Export for manual testing
window.voiceQualityTest = {
  testAudioContext,
  testMicrophone,
  testAudioProcessing,
  testPCMConversion,
  testResampling,
  runAllTests
}; 