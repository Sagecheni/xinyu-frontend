<template>
  <transition name="settings-fade">
    <div v-if="isVisible" class="settings-overlay" @click="closeSettings">
      <div class="settings-panel" @click.stop>
        <!-- Header -->
        <div class="settings-header">
          <h2 class="settings-title">
            <span class="settings-icon">⚙️</span>
            设置
          </h2>
          <button class="close-button" @click="closeSettings">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Settings Content -->
        <div class="settings-content">
          <!-- Theme Settings -->
          <div class="setting-group">
            <h3 class="group-title">外观设置</h3>
            
            <div class="setting-item">
              <label class="setting-label">主题模式</label>
              <div class="theme-selector">
                <button 
                  v-for="theme in themes" 
                  :key="theme.value"
                  class="theme-option"
                  :class="{ active: currentTheme === theme.value }"
                  @click="setTheme(theme.value)"
                >
                  <span class="theme-icon">{{ theme.icon }}</span>
                  <span class="theme-name">{{ theme.name }}</span>
                </button>
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-label">动画效果</label>
              <div class="toggle-switch" :class="{ active: animationsEnabled }" @click="toggleAnimations">
                <div class="toggle-handle"></div>
              </div>
            </div>
          </div>

          <!-- Audio Settings -->
          <div class="setting-group">
            <h3 class="group-title">音频设置</h3>
            
            <div class="setting-item">
              <label class="setting-label">语音音量</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  class="volume-slider" 
                  min="0" 
                  max="100" 
                  v-model="audioVolume"
                  @input="updateVolume"
                />
                <span class="slider-value">{{ audioVolume }}%</span>
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-label">语音速度</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  class="speed-slider" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  v-model="speechRate"
                  @input="updateSpeechRate"
                />
                <span class="slider-value">{{ speechRate }}x</span>
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-label">麦克风敏感度</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  class="sensitivity-slider" 
                  min="1" 
                  max="10" 
                  v-model="micSensitivity"
                  @input="updateMicSensitivity"
                />
                <span class="slider-value">{{ micSensitivity }}</span>
              </div>
            </div>
          </div>

          <!-- Interaction Settings -->
          <div class="setting-group">
            <h3 class="group-title">交互设置</h3>
            
            <div class="setting-item">
              <label class="setting-label">自动滚动</label>
              <div class="toggle-switch" :class="{ active: autoScroll }" @click="toggleAutoScroll">
                <div class="toggle-handle"></div>
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-label">显示情绪分析</label>
              <div class="toggle-switch" :class="{ active: showEmotion }" @click="toggleEmotion">
                <div class="toggle-handle"></div>
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-label">键盘快捷键提示</label>
              <div class="toggle-switch" :class="{ active: showShortcuts }" @click="toggleShortcuts">
                <div class="toggle-handle"></div>
              </div>
            </div>
          </div>

          <!-- About Section -->
          <div class="setting-group">
            <h3 class="group-title">关于</h3>
            <div class="about-content">
              <div class="app-info">
                <div class="app-logo">🤖</div>
                <div class="app-details">
                  <h4>心语 AI 助手</h4>
                  <p>版本 1.0.0</p>
                  <p>智能语音交互系统</p>
                </div>
              </div>
              <div class="developer-info">
                <p>© 2024 心语团队</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="settings-footer">
          <button class="reset-button" @click="resetSettings">
            <span class="button-icon">🔄</span>
            重置默认设置
          </button>
          <button class="save-button" @click="saveSettings">
            <span class="button-icon">💾</span>
            保存设置
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'SettingsPanel',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentTheme: 'auto',
      animationsEnabled: true,
      audioVolume: 80,
      speechRate: 1.0,
      micSensitivity: 5,
      autoScroll: true,
      showEmotion: true,
      showShortcuts: true,
      themes: [
        { value: 'light', name: '浅色', icon: '☀️' },
        { value: 'dark', name: '深色', icon: '🌙' },
        { value: 'auto', name: '自动', icon: '🌗' }
      ]
    };
  },
  methods: {
    closeSettings() {
      this.$emit('close');
    },

    setTheme(theme) {
      this.currentTheme = theme;
      this.$emit('theme-changed', theme);
    },

    toggleAnimations() {
      this.animationsEnabled = !this.animationsEnabled;
      this.$emit('animations-changed', this.animationsEnabled);
    },

    updateVolume() {
      this.$emit('volume-changed', this.audioVolume);
    },

    updateSpeechRate() {
      this.$emit('speech-rate-changed', this.speechRate);
    },

    updateMicSensitivity() {
      this.$emit('mic-sensitivity-changed', this.micSensitivity);
    },

    toggleAutoScroll() {
      this.autoScroll = !this.autoScroll;
      this.$emit('auto-scroll-changed', this.autoScroll);
    },

    toggleEmotion() {
      this.showEmotion = !this.showEmotion;
      this.$emit('emotion-display-changed', this.showEmotion);
    },

    toggleShortcuts() {
      this.showShortcuts = !this.showShortcuts;
      this.$emit('shortcuts-display-changed', this.showShortcuts);
    },

    resetSettings() {
      this.currentTheme = 'auto';
      this.animationsEnabled = true;
      this.audioVolume = 80;
      this.speechRate = 1.0;
      this.micSensitivity = 5;
      this.autoScroll = true;
      this.showEmotion = true;
      this.showShortcuts = true;
      
      this.$emit('settings-reset');
      this.showNotification('设置已重置为默认值');
    },

    saveSettings() {
      const settings = {
        theme: this.currentTheme,
        animations: this.animationsEnabled,
        volume: this.audioVolume,
        speechRate: this.speechRate,
        micSensitivity: this.micSensitivity,
        autoScroll: this.autoScroll,
        showEmotion: this.showEmotion,
        showShortcuts: this.showShortcuts
      };
      
      localStorage.setItem('xinyu-settings', JSON.stringify(settings));
      this.$emit('settings-saved', settings);
      this.showNotification('设置已保存');
    },

    loadSettings() {
      try {
        const saved = localStorage.getItem('xinyu-settings');
        if (saved) {
          const settings = JSON.parse(saved);
          Object.assign(this, settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    },

    showNotification(message) {
      // Emit to parent to show notification
      this.$emit('show-notification', message, 'success');
    }
  },

  mounted() {
    this.loadSettings();
  }
};
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.settings-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
}

.settings-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-icon {
  font-size: 24px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.setting-group {
  margin-bottom: 30px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.theme-selector {
  display: flex;
  gap: 8px;
}

.theme-option {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.theme-option:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
}

.theme-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.theme-icon {
  font-size: 16px;
}

.theme-name {
  font-size: 11px;
  font-weight: 500;
}

.toggle-switch {
  width: 48px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle-handle {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-handle {
  transform: translateX(24px);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 150px;
}

.volume-slider,
.speed-slider,
.sensitivity-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb,
.speed-slider::-webkit-slider-thumb,
.sensitivity-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-value {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
}

.about-content {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.app-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.app-logo {
  font-size: 32px;
}

.app-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.app-details p {
  margin: 2px 0;
  font-size: 12px;
  color: #6b7280;
}

.developer-info {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.developer-info p {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.settings-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
}

.reset-button,
.save-button {
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.reset-button {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.reset-button:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

.save-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.button-icon {
  font-size: 14px;
}

/* Transitions */
.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.settings-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .settings-overlay {
    padding: 10px;
  }
  
  .settings-panel {
    max-height: 90vh;
  }
  
  .settings-header {
    padding: 16px 20px;
  }
  
  .settings-content {
    padding: 16px 20px;
  }
  
  .settings-footer {
    padding: 12px 20px;
    flex-direction: column;
    gap: 8px;
  }
  
  .slider-container {
    min-width: 120px;
  }
  
  .theme-selector {
    flex-wrap: wrap;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .settings-panel {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 30, 30, 0.9) 100%);
  }
  
  .settings-title {
    color: #e2e8f0;
  }
  
  .group-title {
    color: #f7fafc;
  }
  
  .setting-label {
    color: #cbd5e0;
  }
  
  .about-content {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .app-details h4 {
    color: #f7fafc;
  }
}
</style>
