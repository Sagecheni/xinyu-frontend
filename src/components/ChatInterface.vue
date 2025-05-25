<template>
  <div class="chat-interface-wrapper" ref="chatWrapper">
    <!-- Audio Visualizer -->
    <div class="audio-visualizer-section" v-if="showAudioVisualizer">
      <AudioVisualizer :is-active="isRecording" :audio-data="audioData" />
    </div>
    
    <div class="chat-messages-container">
      <transition-group name="message-fade" tag="div" class="messages-list">
        <div v-for="message in messages" :key="message.id"
             class="message-row"
             :class="getMessageClass(message.sender)">
          
          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="avatar" :class="'avatar-' + message.sender">
              <span class="avatar-icon">{{ getAvatarIcon(message.sender) }}</span>
            </div>
          </div>

          <!-- Message Content -->
          <div class="message-content">
            <div class="message-bubble" :class="'bubble-' + message.sender">
              <div class="message-header" v-if="message.sender !== 'user'">
                <span class="sender-name">{{ getSenderName(message.sender) }}</span>
              </div>
              
              <div class="message-text-wrapper">
                <p class="message-text">{{ message.text }}</p>
                
                <!-- Emotion Display with improved styling -->
                <div v-if="message.emotion" class="emotion-container">
                  <div class="emotion-chip">
                    <span class="emotion-icon">{{ getEmotionIcon(message.emotion) }}</span>
                    <span class="emotion-text">{{ formatEmotion(message.emotion) }}</span>
                  </div>
                </div>
              </div>

              <div class="message-footer">
                <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
                <div v-if="message.sender === 'user'" class="message-status">
                  <svg class="status-icon" viewBox="0 0 16 16" width="12" height="12">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- Typing Indicator -->
      <div v-if="isTyping" class="typing-indicator">
        <div class="avatar avatar-xinyu">
          <span class="avatar-icon">🤖</span>
        </div>
        <div class="typing-bubble">
          <div class="typing-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll to Bottom Button -->
    <transition name="scroll-button-fade">
      <button v-if="showScrollButton" @click="scrollToBottom" class="scroll-to-bottom">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M7 14l5 5 5-5z" fill="currentColor"/>
        </svg>
      </button>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'ChatInterface',
  props: {
    messages: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isTyping: false,
      showScrollButton: false,
    };
  },
  methods: {
    formatTimestamp(date) {
      if (!date) return '';
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        const wrapper = this.$refs.chatWrapper;
        if (wrapper) {
          wrapper.scrollTop = wrapper.scrollHeight;
        }
      });
    },
    
    getMessageClass(sender) {
      return {
        'sender-user': sender === 'user',
        'sender-xinyu': sender === 'xinyu' || sender === 'assistant',
      };
    },
    
    getAvatarIcon(sender) {
      const icons = {
        user: '👤',
        xinyu: '🤖',
        assistant: '🤖',
      };
      return icons[sender] || '💬';
    },
    
    getSenderName(sender) {
      const names = {
        xinyu: '心语',
        assistant: '心语',
        user: '您',
      };
      return names[sender] || sender;
    },
    
    getEmotionIcon(emotion) {
      const emotionIcons = {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        surprised: '😮',
        neutral: '😐',
        joy: '😄',
        fear: '😨',
        disgust: '🤢',
        anticipation: '😌',
        trust: '😇',
      };
      return emotionIcons[emotion] || '💭';
    },
    
    formatEmotion(emotion) {
      const emotionNames = {
        happy: '开心',
        sad: '悲伤',
        angry: '愤怒',
        surprised: '惊讶',
        neutral: '平静',
        joy: '喜悦',
        fear: '恐惧',
        disgust: '厌恶',
        anticipation: '期待',
        trust: '信任',
      };
      return emotionNames[emotion] || emotion;
    },
    
    handleScroll() {
      const wrapper = this.$refs.chatWrapper;
      if (!wrapper) return;
      
      const isNearBottom = wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 100;
      this.showScrollButton = !isNearBottom;
    },
  },
  watch: {
    messages: {
      handler() {
        this.scrollToBottom();
      },
      deep: true,
    }
  },
  mounted() {
    this.scrollToBottom();
    this.$refs.chatWrapper.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    if (this.$refs.chatWrapper) {
      this.$refs.chatWrapper.removeEventListener('scroll', this.handleScroll);
    }
  }
};
</script>

<style scoped>
.chat-interface-wrapper {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.1) 0%, rgba(173, 181, 189, 0.1) 100%);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  margin: 10px;
  position: relative;
  max-height: calc(100vh - 240px);
}

.chat-interface-wrapper::-webkit-scrollbar {
  width: 8px;
}

.chat-interface-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.chat-interface-wrapper::-webkit-scrollbar-thumb {
  background: rgba(52, 152, 219, 0.5);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.chat-interface-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(52, 152, 219, 0.8);
}

.chat-messages-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 80%;
  animation: slideIn 0.3s ease-out;
}

.sender-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.sender-xinyu {
  align-self: flex-start;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.avatar:hover {
  transform: scale(1.1);
}

.avatar-user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar-xinyu {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.avatar-icon {
  font-size: 18px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.message-content {
  flex-grow: 1;
  min-width: 0;
}

.message-bubble {
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.bubble-user {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  color: white;
  border-bottom-right-radius: 8px;
}

.bubble-xinyu {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  color: #2d3748;
  border-bottom-left-radius: 8px;
}

.message-header {
  padding: 8px 16px 4px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sender-name {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.message-text-wrapper {
  padding: 12px 16px;
}

.message-text {
  margin: 0;
  line-height: 1.6;
  font-size: 14px;
  word-wrap: break-word;
}

.emotion-container {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.bubble-xinyu .emotion-container {
  justify-content: flex-start;
}

.emotion-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.bubble-xinyu .emotion-chip {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border-color: rgba(52, 152, 219, 0.2);
}

.emotion-icon {
  font-size: 12px;
}

.emotion-text {
  font-size: 10px;
}

.message-footer {
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.05);
}

.bubble-user .message-footer {
  background: rgba(255, 255, 255, 0.1);
}

.timestamp {
  font-size: 11px;
  opacity: 0.7;
  font-weight: 400;
}

.message-status {
  display: flex;
  align-items: center;
}

.status-icon {
  opacity: 0.7;
}

.typing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 80%;
  align-self: flex-start;
  animation: fadeIn 0.3s ease-out;
}

.typing-bubble {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 20px;
  border-bottom-left-radius: 8px;
  padding: 16px 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  animation: typingBounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

.scroll-to-bottom {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(79, 172, 254, 0.4);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.scroll-to-bottom:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 30px rgba(79, 172, 254, 0.6);
}

.scroll-to-bottom:active {
  transform: translateY(0) scale(0.95);
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Transition Effects */
.message-fade-enter-active {
  transition: all 0.5s ease-out;
}

.message-fade-enter {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.scroll-button-fade-enter-active,
.scroll-button-fade-leave-active {
  transition: all 0.3s ease;
}

.scroll-button-fade-enter,
.scroll-button-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .chat-interface-wrapper {
    padding: 15px;
    margin: 5px;
    border-radius: 10px;
  }
  
  .message-row {
    max-width: 90%;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
  }
  
  .avatar-icon {
    font-size: 16px;
  }
  
  .message-text {
    font-size: 13px;
  }
  
  .scroll-to-bottom {
    width: 40px;
    height: 40px;
    bottom: 15px;
    right: 15px;
  }
}

@media (max-width: 480px) {
  .chat-interface-wrapper {
    padding: 10px;
    margin: 2px;
  }
  
  .message-row {
    max-width: 95%;
    gap: 8px;
  }
  
  .avatar {
    width: 28px;
    height: 28px;
  }
  
  .avatar-icon {
    font-size: 14px;
  }
  
  .message-bubble {
    border-radius: 16px;
  }
  
  .message-text-wrapper {
    padding: 10px 12px;
  }
  
  .message-footer {
    padding: 6px 12px;
  }
}
</style>