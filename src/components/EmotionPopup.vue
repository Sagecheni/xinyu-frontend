<template>
  <transition name="emotion-popup">
    <div v-if="isVisible" class="emotion-popup">
      <div class="emotion-popup-content">
        <img :src="getEmotionImage()" :alt="emotion" class="emotion-image" />
        <div class="emotion-text-container">
          <span class="emotion-label">检测到情绪:</span>
          <span class="emotion-value">{{ formatEmotion(emotion) }}</span>
        </div>
        <button class="close-button" @click="closePopup" aria-label="关闭">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'EmotionPopup',
  props: {
    emotion: {
      type: String,
      required: true
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatEmotion(emotionKey) {
      const emotionMap = {
        "HAPPY": "开心 😊",
        "SAD": "难过 😔",
        "ANGRY": "生气 😠",
        "NEUTRAL": "平静 😐",
        "FEARFUL": "有点小紧张 😟",
        "DISGUSTED": "不太舒服 😒",
        "SURPRISED": "惊讶 😮",
        // 小写情况
        "happy": "开心 😊",
        "sad": "难过 😔",
        "angry": "生气 😠",
        "neutral": "平静 😐",
        "fearful": "有点小紧张 😟",
        "disgusted": "不太舒服 😒",
        "surprised": "惊讶 😮"
      };
      return emotionMap[emotionKey] || emotionKey;
    },
    getEmotionImage() {
      // 根据情绪类型返回正确的图片路径
      let imageName = 'neutral.png'; // 默认为平静
      
      const emotionKey = this.emotion.toLowerCase();
      if (emotionKey.includes('happy') || emotionKey.includes('joy')) {
        imageName = 'happy.png';
      } else if (emotionKey.includes('sad') || emotionKey.includes('fearful')) {
        imageName = 'sad.png';
      } else if (emotionKey.includes('neutral')) {
        imageName = 'neutral.png';
      }
      
      return new URL(`../assets/emotions/${imageName}`, import.meta.url).href;
    },
    closePopup() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.emotion-popup {
  position: fixed;
  bottom: 110px;
  right: 20px;
  z-index: 1000;
  max-width: 200px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.15),
    0 5px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transform-origin: bottom right;
}

.emotion-popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  position: relative;
}

.emotion-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 10px;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.1));
}

.emotion-text-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.emotion-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.emotion-value {
  font-size: 16px;
  color: #334155;
  font-weight: 600;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #334155;
}

/* 动画效果 */
.emotion-popup-enter-active,
.emotion-popup-leave-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.emotion-popup-enter-from,
.emotion-popup-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .emotion-popup {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .emotion-label {
    color: #94a3b8;
  }
  
  .emotion-value {
    color: #e2e8f0;
  }
  
  .close-button {
    background: rgba(255, 255, 255, 0.1);
    color: #94a3b8;
  }
  
  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .emotion-popup {
    bottom: 100px;
    right: 15px;
    max-width: 180px;
  }
  
  .emotion-image {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 480px) {
  .emotion-popup {
    bottom: 90px;
    right: 10px;
    max-width: 160px;
  }
  
  .emotion-image {
    width: 60px;
    height: 60px;
  }
  
  .emotion-value {
    font-size: 14px;
  }
}
</style>
