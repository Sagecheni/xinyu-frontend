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
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
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
                <button v-for="theme in themes" :key="theme.value" class="theme-option"
                  :class="{ active: currentTheme === theme.value }" @click="setTheme(theme.value)">
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
                <input type="range" class="volume-slider" min="0" max="100" v-model="audioVolume"
                  @input="updateVolume" />
                <span class="slider-value">{{ audioVolume }}%</span>
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-label">语音速度</label>
              <div class="slider-container">
                <input type="range" class="speed-slider" min="0.5" max="2" step="0.1" v-model="speechRate"
                  @input="updateSpeechRate" />
                <span class="slider-value">{{ speechRate }}x</span>
              </div>
            </div>

            <div class="setting-item">
              <label class="setting-label">麦克风敏感度</label>
              <div class="slider-container">
                <input type="range" class="sensitivity-slider" min="1" max="10" v-model="micSensitivity"
                  @input="updateMicSensitivity" />
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
          <!-- 在现有设置项后添加声音克隆部分 -->
          <div class="setting-group">
            <h3>🎤 声音克隆</h3>

            <div class="setting-item">
              <label>参考音频</label>
              <div class="voice-clone-controls">
                <button class="record-reference-btn" :class="{ recording: isRecordingReference }"
                  @click="toggleReferenceRecording" :disabled="isProcessingVoiceClone">
                  <span v-if="!isRecordingReference">🎙️ 录制参考音频</span>
                  <span v-else>⏹️ 停止录制</span>
                </button>

                <div v-if="referenceAudio" class="reference-audio-info">
                  <span class="audio-duration">{{ formatDuration(referenceAudioDuration) }}</span>
                  <button class="play-reference-btn" @click="playReferenceAudio">
                    🔊 试听
                  </button>
                  <button class="delete-reference-btn" @click="deleteReferenceAudio">
                    🗑️ 删除
                  </button>
                </div>
              </div>

              <div class="voice-clone-tips">
                <p>📝 请录制 10-30 秒清晰的中文语音作为声音参考</p>
                <p>💡 建议在安静环境下录制，说话清晰流畅</p>
              </div>
            </div>

            <div class="setting-item">
              <label>参考文本</label>
              <textarea v-model="referenceText" class="reference-text-input" placeholder="请输入参考音频对应的文本内容..." rows="3"
                :disabled="isProcessingVoiceClone"></textarea>
            </div>

            <div class="setting-item">
              <button class="upload-reference-btn" @click="uploadReferenceAudio"
                :disabled="!canUploadReference || isProcessingVoiceClone"
                :class="{ processing: isProcessingVoiceClone }">
                <span v-if="!isProcessingVoiceClone">🚀 上传并启用声音克隆</span>
                <span v-else>⏳ 处理中...</span>
              </button>
            </div>
            <!-- 新增：重启TTS服务按钮 -->
            <div class="setting-item">
              <button class="restart-tts-btn" @click="restartTTSService" :disabled="isProcessingTTSRestart"
                :class="{ processing: isProcessingTTSRestart }">
                <span v-if="!isProcessingTTSRestart">🔄 重启语音生成服务</span>
                <span v-else>⏳ 重启中...</span>
              </button>
              <div class="restart-tts-tips">
                <p>🔧 重启服务将取消当前的声音克隆设置</p>
                <p>💡 如果语音生成出现问题，可以尝试重启服务</p>
              </div>
            </div>


            <div v-if="voiceCloneStatus" class="voice-clone-status" :class="voiceCloneStatus.type">
              {{ voiceCloneStatus.message }}
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
      ],
      isRecordingReference: false,
      referenceAudio: null,
      referenceAudioDuration: 0,
      referenceText: '',
      isProcessingVoiceClone: false,
      voiceCloneStatus: null,
      referenceAudioContext: null,
      referenceAudioUrl: null,
      referenceMediaRecorder: null,
      referenceAudioChunks: [],
      recordingStartTime: null,
      isProcessingTTSRestart: false,
    };
  },
  computed: {
    canUploadReference() {
      return this.referenceAudio &&
        this.referenceText.trim().length > 0 &&
        !this.isProcessingVoiceClone;
    }
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
    },

    async toggleReferenceRecording() {
      if (this.isRecordingReference) {
        this.stopReferenceRecording();
      } else {
        await this.startReferenceRecording();
      }
    },

    async startReferenceRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        this.referenceAudioChunks = [];

        // 尝试使用更兼容的录音格式
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // 使用默认格式
        }

        this.referenceMediaRecorder = new MediaRecorder(stream,
          mimeType ? { mimeType } : undefined
        );

        // 记录开始时间用于计算时长
        this.recordingStartTime = Date.now();

        this.referenceMediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.referenceAudioChunks.push(event.data);
          }
        };

        this.referenceMediaRecorder.onstop = async () => {
          // 计算录制时长
          const recordingDuration = (Date.now() - this.recordingStartTime) / 1000;

          // 创建音频Blob
          const audioBlob = new Blob(this.referenceAudioChunks, {
            type: this.referenceMediaRecorder.mimeType
          });

          // 保存Blob用于上传
          this.referenceAudio = audioBlob;

          // 先设置计算出的时长
          this.referenceAudioDuration = recordingDuration;

          // 尝试通过音频元素获取精确时长
          await this.calculateAudioDuration(audioBlob, recordingDuration);

          // 停止所有音频轨道
          stream.getTracks().forEach(track => track.stop());
        };

        this.referenceMediaRecorder.start();
        this.isRecordingReference = true;
        this.voiceCloneStatus = null;

        this.$emit('show-notification', '开始录制参考音频...', 'info');

      } catch (error) {
        console.error('Failed to start reference recording:', error);
        this.$emit('show-notification', '无法访问麦克风：' + error.message, 'error');
      }
    },

    stopReferenceRecording() {
      if (this.referenceMediaRecorder && this.isRecordingReference) {
        this.referenceMediaRecorder.stop();
        this.isRecordingReference = false;
        this.$emit('show-notification', '参考音频录制完成', 'success');
      }
    },

    async calculateAudioDuration(audioBlob, fallbackDuration = 0) {
      return new Promise((resolve) => {
        const audio = new Audio();

        // 设置超时，避免无限等待
        const timeout = setTimeout(() => {
          console.warn('音频时长计算超时，使用录制时长');
          if (fallbackDuration > 0) {
            this.referenceAudioDuration = fallbackDuration;
          }
          resolve(fallbackDuration);
        }, 3000);

        audio.onloadedmetadata = () => {
          clearTimeout(timeout);

          // 检查是否获取到有效时长
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            this.referenceAudioDuration = audio.duration;
            resolve(audio.duration);
          } else {
            console.warn('无法获取音频时长，使用录制时长');
            if (fallbackDuration > 0) {
              this.referenceAudioDuration = fallbackDuration;
            }
            resolve(fallbackDuration);
          }
        };

        audio.onerror = () => {
          clearTimeout(timeout);
          console.warn('音频加载失败，使用录制时长');
          if (fallbackDuration > 0) {
            this.referenceAudioDuration = fallbackDuration;
          }
          resolve(fallbackDuration);
        };

        // 创建URL用于试听和计算时长
        if (this.referenceAudioUrl) {
          URL.revokeObjectURL(this.referenceAudioUrl);
        }
        this.referenceAudioUrl = URL.createObjectURL(audioBlob);
        audio.src = this.referenceAudioUrl;
      });
    },

    playReferenceAudio() {
      if (this.referenceAudioUrl) {
        const audio = new Audio();
        audio.src = this.referenceAudioUrl;
        audio.play().catch(error => {
          console.error('播放音频失败:', error);
          this.$emit('show-notification', '播放音频失败', 'error');
        });
      } else if (this.referenceAudio) {
        // 备用方案：重新创建URL
        const audioUrl = URL.createObjectURL(this.referenceAudio);
        const audio = new Audio();
        audio.src = audioUrl;
        audio.play().catch(error => {
          console.error('播放音频失败:', error);
          this.$emit('show-notification', '播放音频失败', 'error');
        });
        // 播放结束后清理URL
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      }
    },

    deleteReferenceAudio() {
      // 清理资源
      if (this.referenceAudioUrl) {
        URL.revokeObjectURL(this.referenceAudioUrl);
        this.referenceAudioUrl = null;
      }

      this.referenceAudio = null;
      this.referenceAudioDuration = 0;
      this.referenceText = '';
      this.voiceCloneStatus = null;
      this.$emit('show-notification', '已删除参考音频', 'info');
    },

    async uploadReferenceAudio() {
      if (!this.canUploadReference) return;

      this.isProcessingVoiceClone = true;
      this.voiceCloneStatus = { type: 'info', message: '正在上传参考音频...' };

      try {
        // 将音频文件转换为 Base64
        const base64Audio = await this.blobToBase64(this.referenceAudio);

        // 构建 JSON payload（按照服务器期望的格式）
        const payload = {
          ref_audio: base64Audio,
          prompt_text: this.referenceText,
          prompt_lang: 'zh'  // 中文
        };

        console.log('[SettingsPanel] Uploading reference audio:', {
          audioSize: this.referenceAudio.size,
          base64Length: base64Audio.length,
          promptText: this.referenceText,
          promptLang: 'zh'
        });

        const VOICE_CLONE_API_BASE = `http://10.129.237.27:9880`;

        // 发送 JSON 请求
        const response = await fetch(`${VOICE_CLONE_API_BASE}/upload_reference_audio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (e) {
            try {
              const errorText = await response.text();
              if (errorText) errorMessage += ` - ${errorText}`;
            } catch (e2) {
              console.warn('Could not parse error response');
            }
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('[SettingsPanel] Upload successful:', result);

        this.voiceCloneStatus = {
          type: 'success',
          message: '声音克隆设置成功！TTS现在将使用您的声音。'
        };

        this.$emit('show-notification', '声音克隆设置成功', 'success');
        this.$emit('voice-clone-updated', {
          enabled: true,
          referenceText: this.referenceText,
          audioDuration: this.referenceAudioDuration
        });

      } catch (error) {
        console.error('[SettingsPanel] Voice clone upload error:', error);
        this.voiceCloneStatus = {
          type: 'error',
          message: `上传失败: ${error.message}`
        };
        this.$emit('show-notification', '声音克隆设置失败：' + error.message, 'error');
      } finally {
        this.isProcessingVoiceClone = false;
      }
    },

    // 修复 blobToBase64 方法，确保返回纯 Base64 字符串
    async blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // 移除 data:audio/wav;base64, 前缀，只保留纯 Base64 字符串
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },
    async restartTTSService() {
      if (this.isProcessingTTSRestart) return;

      // 显示确认对话框
      const confirmed = confirm('确定要重启语音生成服务吗？这将取消当前的声音克隆设置。');
      if (!confirmed) return;

      this.isProcessingTTSRestart = true;
      this.voiceCloneStatus = { type: 'info', message: '正在重启语音生成服务...' };

      try {
        this.$emit('show-notification', '正在重启语音生成服务，请稍候...', 'info');

        const response = await fetch('http://10.129.237.27:9880/control?command=restart', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // 清除本地声音克隆状态
          this.deleteReferenceAudio();

          this.voiceCloneStatus = {
            type: 'success',
            message: '语音生成服务重启成功，声音克隆已取消'
          };

          this.$emit('show-notification', '语音生成服务重启成功', 'success');

          // 通知父组件重启成功
          this.$emit('tts-service-restart');

          try {
            const responseData = await response.json();
            console.log('[SettingsPanel] TTS服务重启响应:', responseData);
          } catch (e) {
            console.log('[SettingsPanel] TTS服务重启成功，响应为非JSON格式');
          }
        } else {
          let errorMsg = `重启失败 (${response.status})`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorData.message || errorMsg;
          } catch (e) {
            errorMsg = response.statusText || errorMsg;
          }

          this.voiceCloneStatus = {
            type: 'error',
            message: `重启失败: ${errorMsg}`
          };

          this.$emit('show-notification', `重启语音生成服务失败: ${errorMsg}`, 'error');
          console.error('[SettingsPanel] TTS服务重启失败:', response.status, errorMsg);
        }
      } catch (error) {
        this.voiceCloneStatus = {
          type: 'error',
          message: `重启时发生错误: ${error.message}`
        };

        this.$emit('show-notification', `重启语音生成服务时出错: ${error.message}`, 'error');
        console.error('[SettingsPanel] 重启TTS服务时发生错误:', error);
      } finally {
        this.isProcessingTTSRestart = false;

        // 3秒后清除状态消息
        setTimeout(() => {
          if (this.voiceCloneStatus && (this.voiceCloneStatus.type === 'success' || this.voiceCloneStatus.type === 'error')) {
            this.voiceCloneStatus = null;
          }
        }, 3000);
      }
    },

    formatDuration(seconds) {
      if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
        return '0:00';
      }

      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
  },

  mounted() {
    this.loadSettings();
  },
  beforeUnmount() {
    if (this.referenceAudioUrl) {
      URL.revokeObjectURL(this.referenceAudioUrl);
    }
  },


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

.voice-clone-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-reference-btn {
  padding: 12px 20px;
  border: 2px solid #3182ce;
  background: transparent;
  color: #3182ce;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.record-reference-btn:hover {
  background: #3182ce;
  color: white;
}

.record-reference-btn.recording {
  background: #e53e3e;
  border-color: #e53e3e;
  color: white;
  animation: pulse 1.5s ease-in-out infinite;
}

.reference-audio-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(56, 161, 105, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(56, 161, 105, 0.3);
}

.audio-duration {
  font-weight: 500;
  color: #38a169;
}

.play-reference-btn,
.delete-reference-btn {
  padding: 6px 12px;
  border: 1px solid;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.play-reference-btn {
  border-color: #3182ce;
  color: #3182ce;
}

.play-reference-btn:hover {
  background: #3182ce;
  color: white;
}

.delete-reference-btn {
  border-color: #e53e3e;
  color: #e53e3e;
}

.delete-reference-btn:hover {
  background: #e53e3e;
  color: white;
}

.voice-clone-tips {
  margin-top: 10px;
  padding: 10px;
  background: rgba(49, 130, 206, 0.1);
  border-radius: 6px;
  border-left: 3px solid #3182ce;
}

.voice-clone-tips p {
  margin: 5px 0;
  font-size: 12px;
  color: #4a5568;
}

.reference-text-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

.reference-text-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.upload-reference-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restart-tts-btn {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.restart-tts-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 101, 101, 0.3);
}

.restart-tts-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.restart-tts-btn.processing {
  animation: pulse 1.5s ease-in-out infinite;
}

.restart-tts-tips {
  padding: 8px 12px;
  background: rgba(245, 101, 101, 0.1);
  border-radius: 6px;
  border-left: 3px solid #f56565;
}

.restart-tts-tips p {
  margin: 4px 0;
  font-size: 12px;
  color: #4a5568;
}

.upload-reference-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.upload-reference-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.upload-reference-btn.processing {
  animation: pulse 1.5s ease-in-out infinite;
}

.voice-clone-status {
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
}

.voice-clone-status.success {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
  border: 1px solid rgba(56, 161, 105, 0.3);
}

.voice-clone-status.error {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.3);
}

.voice-clone-status.info {
  background: rgba(49, 130, 206, 0.1);
  color: #3182ce;
  border: 1px solid rgba(49, 130, 206, 0.3);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
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
