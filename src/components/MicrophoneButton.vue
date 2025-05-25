<template>
  <div class="mic-button-container">
    <!-- Outer ring for recording animation -->
    <div v-if="isRecording" class="recording-ring"></div>
    
    <!-- Main button -->
    <button
      class="mic-button"
      :class="{ 
        'is-recording': isRecording, 
        'is-disabled': isDisabled,
        'is-listening': isListening 
      }"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @touchstart.prevent="handleMouseDown"
      @touchend.prevent="handleMouseUp"
      :disabled="isDisabled"
    >
      <!-- Recording waves animation -->
      <div v-if="isRecording" class="sound-waves">
        <div class="wave wave-1"></div>
        <div class="wave wave-2"></div>
        <div class="wave wave-3"></div>
      </div>
      
      <!-- Microphone icon when not recording -->
      <svg v-if="!isRecording && !isDisabled" 
           class="mic-icon" 
           xmlns="http://www.w3.org/2000/svg" 
           width="32" height="32" 
           viewBox="0 0 24 24" 
           fill="none" 
           stroke="currentColor" 
           stroke-width="2" 
           stroke-linecap="round" 
           stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
      
      <!-- Recording icon -->
      <svg v-else-if="isRecording" 
           class="recording-icon" 
           xmlns="http://www.w3.org/2000/svg" 
           width="32" height="32" 
           viewBox="0 0 24 24" 
           fill="currentColor">
        <circle cx="12" cy="12" r="6"></circle>
      </svg>
      
      <!-- Disabled icon -->
      <svg v-else 
           class="disabled-icon" 
           xmlns="http://www.w3.org/2000/svg" 
           width="32" height="32" 
           viewBox="0 0 24 24" 
           fill="none" 
           stroke="currentColor" 
           stroke-width="2" 
           stroke-linecap="round" 
           stroke-linejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    </button>
    
    <!-- Tooltip -->
    <div class="tooltip" :class="{ 'visible': showTooltip }">
      <span v-if="isDisabled">处理中...</span>
      <span v-else-if="isRecording">正在录音 - 松开结束</span>
      <span v-else>按住说话</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MicrophoneButton',
  props: {
    isRecording: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isListening: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      showTooltip: false,
      tooltipTimer: null,
    };
  },
  methods: {
    handleMouseDown() {
      if (this.isDisabled) return;
      this.showTooltipBriefly();
      this.$emit('recording-start');
    },
    
    handleMouseUp() {
      if (this.isDisabled) return;
      if (this.isRecording) {
        this.$emit('recording-stop');
      }
    },
    
    showTooltipBriefly() {
      this.showTooltip = true;
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = setTimeout(() => {
        this.showTooltip = false;
      }, 2000);
    },
  },
  
  mounted() {
    // Show tooltip initially
    this.showTooltipBriefly();
  },
  
  beforeDestroy() {
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
    }
  }
};
</script>

<style scoped>
.mic-button-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 20px;
}

.mic-button {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 
    0 8px 32px rgba(102, 126, 234, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  overflow: hidden;
  z-index: 2;
}

.mic-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mic-button:hover:not(.is-disabled)::before {
  opacity: 1;
}

.mic-button:hover:not(.is-disabled) {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 
    0 12px 40px rgba(102, 126, 234, 0.6),
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.mic-button:active:not(.is-disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 8px 32px rgba(102, 126, 234, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.2);
}

.mic-button.is-recording {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  animation: recordingPulse 1.5s ease-in-out infinite;
  box-shadow: 
    0 8px 32px rgba(255, 107, 107, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.mic-button.is-listening {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  animation: listeningPulse 2s ease-in-out infinite;
}

.mic-button.is-disabled {
  background: linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%);
  cursor: not-allowed;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: none;
}

.mic-button.is-disabled::before {
  display: none;
}

/* Icons */
.mic-icon, .recording-icon, .disabled-icon {
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.recording-icon {
  animation: iconScale 1.5s ease-in-out infinite;
}

.disabled-icon {
  opacity: 0.7;
}

/* Recording ring animation */
.recording-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 3px solid rgba(255, 107, 107, 0.6);
  border-radius: 50%;
  animation: recordingRing 1.5s ease-in-out infinite;
  z-index: 1;
}

/* Sound waves animation */
.sound-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 3px;
  z-index: 3;
}

.wave {
  width: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  animation: soundWave 1.2s ease-in-out infinite;
}

.wave-1 {
  height: 20px;
  animation-delay: 0s;
}

.wave-2 {
  height: 30px;
  animation-delay: 0.2s;
}

.wave-3 {
  height: 20px;
  animation-delay: 0.4s;
}

/* Tooltip */
.tooltip {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  pointer-events: none;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.tooltip.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Animations */
@keyframes recordingPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 
      0 8px 32px rgba(255, 107, 107, 0.5),
      0 4px 16px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 
      0 12px 40px rgba(255, 107, 107, 0.7),
      0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

@keyframes listeningPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 
      0 8px 32px rgba(79, 172, 254, 0.4),
      0 4px 16px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 
      0 10px 36px rgba(79, 172, 254, 0.6),
      0 6px 20px rgba(0, 0, 0, 0.12);
  }
}

@keyframes recordingRing {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes iconScale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes soundWave {
  0%, 100% {
    transform: scaleY(1);
    opacity: 0.8;
  }
  50% {
    transform: scaleY(1.5);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .mic-button {
    width: 70px;
    height: 70px;
  }
  
  .mic-icon, .recording-icon, .disabled-icon {
    width: 28px;
    height: 28px;
  }
  
  .recording-ring {
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    border-width: 2px;
  }
  
  .tooltip {
    font-size: 11px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .mic-button-container {
    margin: 15px;
  }
  
  .mic-button {
    width: 60px;
    height: 60px;
  }
  
  .mic-icon, .recording-icon, .disabled-icon {
    width: 24px;
    height: 24px;
  }
  
  .wave {
    width: 3px;
  }
  
  .wave-1, .wave-3 {
    height: 16px;
  }
  
  .wave-2 {
    height: 24px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .tooltip {
    background: rgba(255, 255, 255, 0.9);
    color: #2d3748;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .mic-button,
  .recording-ring,
  .wave,
  .tooltip {
    animation: none;
    transition: none;
  }
  
  .mic-button:hover:not(.is-disabled) {
    transform: none;
  }
}

/* Focus states for accessibility */
.mic-button:focus-visible {
  outline: 3px solid rgba(102, 126, 234, 0.5);
  outline-offset: 4px;
}
</style>