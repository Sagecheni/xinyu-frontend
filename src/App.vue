<template>
  <div id="xinyu-app" :class="themeClass">

    <!-- Splash Screen -->
    <SplashScreen v-if="showSplash" @splash-finished="handleSplashFinished" />

    <!-- Main App Content -->
    <div v-else class="main-app-content">
      <!-- Enhanced Background Decorations -->
      <div class="background-decorations">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
        <div class="decoration-particle particle-1"></div>
        <div class="decoration-particle particle-2"></div>
        <div class="decoration-particle particle-3"></div>
        <div class="decoration-wave wave-1"></div>
        <div class="decoration-wave wave-2"></div>
      </div>

      <!-- Enhanced Header -->
      <header class="app-header">
        <div class="header-glow"></div>
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-container">
              <div class="logo-icon">🤖</div>
              <div class="logo-ring"></div>
            </div>
            <div class="title-container">
              <h1>心语云</h1>
              <span class="subtitle">AI情感陪伴小助理</span>
            </div>
          </div>
          <div class="status-section">
            <div class="status-indicator" :class="getStatusClass()">
              <div class="status-dot"></div>
              <span class="status-text">{{ statusMessage }}</span>
              <div class="status-wave"></div>
            </div>
            <button class="settings-button" @click="toggleSettings" title="设置">
              <div class="button-glow"></div>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="none" stroke="currentColor" stroke-width="2" />
                <path
                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.0a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                  fill="none" stroke="currentColor" stroke-width="2" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Chat Interface -->
      <main class="app-main">
        <ChatInterface :messages="messages" />
      </main>

      <!-- Enhanced Footer Controls -->
      <footer class="app-footer">
        <transition name="processing-fade" mode="out-in">
          <div v-if="isProcessing" class="processing-indicator" key="processing">
            <div class="processing-shimmer"></div>
            <div class="processing-animation">
              <div class="processing-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
            </div>
            <span class="processing-text">心语正在思考...</span>
          </div>

          <div v-else class="control-section" key="controls">
            <MicrophoneButton v-if="isAwoken" @recording-start="handleRecordingStart"
              @recording-stop="handleRecordingStop" :is-recording="isRecording" :is-disabled="isProcessing" />

            <transition name="status-fade">
              <p v-if="isAwoken && isRecording" class="recording-status active">
                <span class="recording-pulse"></span>
                心语正在聆听您的指令...
              </p>
              <p v-else-if="!isAwoken" class="recording-status">
                请说出唤醒词"小云小云"以激活心语
              </p>
            </transition>
          </div>
        </transition>
      </footer>

      <!-- Settings Panel -->
      <SettingsPanel :is-visible="showSettings" @close="toggleSettings" @theme-changed="handleThemeChanged"
        @animations-changed="handleAnimationsChanged" @volume-changed="handleVolumeChanged"
        @speech-rate-changed="handleSpeechRateChanged" @mic-sensitivity-changed="handleMicSensitivityChanged"
        @auto-scroll-changed="handleAutoScrollChanged" @emotion-display-changed="handleEmotionDisplayChanged"
        @shortcuts-display-changed="handleShortcutsDisplayChanged" @voice-clone-updated="handleVoiceCloneUpdated"
        @settings-reset="handleSettingsReset" @settings-saved="handleSettingsSaved"
        @tts-service-restart="handleTTSServiceRestart" @show-notification="showNotification" />

      <!-- Enhanced Keyboard Shortcuts Help -->
      <div class="keyboard-help" :class="{ show: showKeyboardHelp }">
        <div class="keyboard-help-header">
          <span class="help-icon">⌨️</span>
          <span class="help-title">快捷键</span>
        </div>
        <div class="keyboard-help-item">
          <span class="keyboard-key">空格</span>
          <span>快速录音</span>
        </div>
        <div class="keyboard-help-item">
          <span class="keyboard-key">ESC</span>
          <span>取消操作</span>
        </div>
        <div class="keyboard-help-item">
          <span class="keyboard-key">Ctrl+R</span>
          <span>重新连接</span>
        </div>
      </div>

      <!-- 情绪弹窗组件 -->
      <EmotionPopup v-if="appSettings.showEmotions" :emotion="currentEmotion" :is-visible="showEmotionPopup"
        @close="hideEmotionPopup" />
    </div>
  </div>
</template>

<script>
import ChatInterface from './components/ChatInterface.vue';
import MicrophoneButton from './components/MicrophoneButton.vue';
import SplashScreen from './components/SplashScreen.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import EmotionPopup from './components/EmotionPopup.vue';

const KWS_SERVER_WEBSOCKET_URL = 'ws://10.129.254.87:8000/ws/kws_sv';
const KWS_WAKE_WORD = "小云小云";
const LLM_API_BASE_URL = 'http://10.129.254.87:8300/stream_audio';
const LLM_AUDIO_STREAM_URL = `http://10.129.254.87:8300/api/audio`;

export default {
  name: 'App',
  components: {
    ChatInterface,
    MicrophoneButton,
    SplashScreen,
    SettingsPanel,
    EmotionPopup
  },
  data() {
    return {
      showSplash: true,
      showSettings: false,
      showKeyboardHelp: false,
      messages: [
        { id: 'xinyu-initial', text: '你好，我是心语。请说出唤醒词"小云小云"来激活我。', sender: 'xinyu', timestamp: new Date() },
      ],
      statusMessage: '等待初始化...',
      isRecording: false,
      isProcessing: false,
      isAwoken: false,

      // === 新增美化相关状态（不影响原有功能）===
      showStatusToast: false,
      toastType: 'info',
      toastTitle: '',
      toastMessage: '',
      connectionStatus: 'disconnected',

      // 情绪显示相关
      currentEmotion: '',
      showEmotionPopup: false,
      emotionPopupTimer: null,

      // App Settings（保持原有设置，添加新的美化选项）
      appSettings: {
        theme: 'auto',
        volume: 0.8,
        micSensitivity: 0.7,
        autoPlay: true,
        keyboardShortcuts: true,
        showEmotions: true,
        animatedBackground: true,
        autoScroll: true,
        speechRate: 1.0,
        voiceClone: null,
        // 新增美化设置
        enableNotifications: true,
        soundEffects: true,
        autoReconnect: true,
        debugMode: false
      },

      kwsSocket: null,
      audioContext: null,
      microphoneStream: null,
      audioProcessorNode: null,
      processorOptions: null,

      TARGET_SAMPLE_RATE: 16000,
      TARGET_CHANNELS: 1,
      llmAudioChunks: [],

      // 声音克隆状态
      voiceCloneEnabled: false,
      voiceCloneInfo: null,

      // === 新增系统监控状态 ===
      systemHealth: {
        microphoneActive: false,
        kwsConnected: false,
        audioContextActive: false
      }
    };
  },
  computed: {
    themeClass() {
      if (this.appSettings.theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-theme' : 'light-theme';
      }
      return this.appSettings.theme === 'dark' ? 'dark-theme' : 'light-theme';
    },

    // === 新增美化计算属性 ===
    isSystemHealthy() {
      return this.systemHealth.microphoneActive &&
        this.systemHealth.kwsConnected &&
        this.systemHealth.audioContextActive;
    }
  },
  methods: {
    // === 保持所有原有方法的完整逻辑 ===

    // Splash screen handler
    handleSplashFinished() {
      this.showSplash = false;
      this.initializeMicrophoneAndKWS(); // 保持原有调用位置

      // Show keyboard help briefly after splash
      setTimeout(() => {
        if (this.appSettings.keyboardShortcuts) {
          this.showKeyboardHelp = true;
          setTimeout(() => {
            this.showKeyboardHelp = false;
          }, 5000);
        }
      }, 1000);
    },

    getStatusClass() {
      if (this.isProcessing) return 'status-processing';
      if (this.isAwoken && this.isRecording) return 'status-recording';
      if (this.isAwoken) return 'status-awoken';
      return 'status-waiting';
    },

    // Enhanced UI methods
    addMessageToChat(text, sender, emotion = null) {
      this.messages.push({
        id: `${sender}-${Date.now()}`,
        text,
        sender,
        emotion,
        timestamp: new Date(),
      });
      this.$nextTick(() => {
        const chatContainer = document.querySelector('.chat-messages-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      });
    },

    // Show notification（保持原有逻辑）
    showNotification(message, type = 'info') {
      if (!this.appSettings.enableNotifications) return;

      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-icon">${this.getNotificationIcon(type)}</span>
          <span class="notification-text">${message}</span>
        </div>
      `;

      // Add to DOM
      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => notification.classList.add('show'), 10);

      // Remove after delay
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 3000);

      // 播放提示音
      this.playNotificationSound();
    },

    getNotificationIcon(type) {
      const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };
      return icons[type] || icons.info;
    },

    // Keyboard shortcuts（修复F12问题）
    handleKeyDown(event) {
      if (!this.appSettings.keyboardShortcuts) return;

      // 允许F12正常工作
      if (event.code === 'F12') {
        return; // 不阻止F12
      }

      // Space bar for quick recording (when awoken)
      if (event.code === 'Space' && this.isAwoken && !this.isRecording && !this.isProcessing) {
        // 检查是否在输入框中
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return; // 不干扰正常输入
        }
        event.preventDefault();
        this.handleRecordingStart();
        this.showNotification('开始录音 - 松开空格键结束', 'info');
      }

      // ESC to reset state or close settings
      if (event.code === 'Escape') {
        if (this.showSettings) {
          this.toggleSettings();
          return;
        }
        if (this.isRecording) {
          this.handleRecordingStop();
        }
        this.showNotification('操作已取消', 'warning');
      }

      // Ctrl/Cmd + R to reconnect（需要Shift配合避免与浏览器刷新冲突）
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyR' && event.shiftKey) {
        event.preventDefault();
        this.reconnectServices();
        this.showNotification('正在重新连接服务...', 'info');
      }
    },

    handleKeyUp(event) {
      if (!this.appSettings.keyboardShortcuts) return;

      // Space bar release
      if (event.code === 'Space' && this.isRecording) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return;
        }
        event.preventDefault();
        this.handleRecordingStop();
      }
    },

    // Reconnect services
    async reconnectServices() {
      try {
        this.statusMessage = '正在重新连接...';
        this.connectionStatus = 'connecting';
        if (this.kwsSocket) {
          this.kwsSocket.close();
        }
        await this.initializeMicrophoneAndKWS();
        this.showNotification('重新连接成功', 'success');
      } catch (error) {
        this.connectionStatus = 'error';
        this.showNotification('重新连接失败: ' + error.message, 'error');
      }
    },

    // Enhanced status management
    updateStatus(message, type = 'info') {
      this.statusMessage = message;
      if (type === 'error') {
        this.showNotification(message, 'error');
      }
    },

    // === 保持所有原有的核心方法完全不变 ===

    async initializeMicrophoneAndKWS() {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        console.log("[Vue App] KWS and Mic already initialized or in process.");
        return;
      }
      this.statusMessage = '正在请求麦克风权限...';
      this.connectionStatus = 'connecting'; // 新增状态更新

      try {
        this.microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: { ideal: this.TARGET_SAMPLE_RATE },
            channelCount: { ideal: this.TARGET_CHANNELS },
            echoCancellation: true,
            noiseSuppression: true
          },
          video: false
        });
        this.statusMessage = '麦克风已授权，正在配置音频环境...';
        this.systemHealth.microphoneActive = true; // 新增状态更新

        this.audioContext = new AudioContext();

        if (this.audioContext.state === 'suspended') {
          console.log('[Vue App] AudioContext is suspended, attempting to resume...');
          await this.audioContext.resume();
          console.log('[Vue App] AudioContext resumed. State:', this.audioContext.state);
        }

        this.systemHealth.audioContextActive = (this.audioContext.state === 'running'); // 新增状态更新

        const actualContextSampleRate = this.audioContext.sampleRate;
        const audioTrack = this.microphoneStream.getAudioTracks()[0];
        const trackSettings = audioTrack.getSettings();
        const actualTrackSampleRate = trackSettings.sampleRate || actualContextSampleRate;
        const actualTrackChannels = trackSettings.channelCount || this.TARGET_CHANNELS;

        console.log(`[Vue App] Mic Track SR: ${actualTrackSampleRate}, Channels: ${actualTrackChannels}. AudioContext SR: ${actualContextSampleRate}. KWS Target SR: ${this.TARGET_SAMPLE_RATE}Hz, Target Channels: ${this.TARGET_CHANNELS}`);
        this.statusMessage = `麦克风 SR: ${actualTrackSampleRate}, 音频环境 SR: ${actualContextSampleRate}. KWS目标: ${this.TARGET_SAMPLE_RATE}Hz`;

        this.processorOptions = {
          inputSampleRate: actualTrackSampleRate,
          inputChannels: actualTrackChannels,
          targetSampleRate: this.TARGET_SAMPLE_RATE,
          targetChannels: this.TARGET_CHANNELS
        };

        await this.connectToKWSService(this.microphoneStream);

      } catch (error) {
        console.error('[Vue App] 麦克风权限获取或KWS初始化失败:', error);
        this.connectionStatus = 'error'; // 新增状态更新
        this.statusMessage = '麦克风错误或KWS初始化失败！';
        if (error.name === "OverconstrainedError") {
          this.statusMessage = `无法获取期望的音频格式 (${this.TARGET_SAMPLE_RATE}Hz, ${this.TARGET_CHANNELS}ch)。请检查麦克风 (${error.constraint})。`;
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          this.statusMessage = "未找到麦克风设备。";
        } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          this.statusMessage = "麦克风权限被拒绝。";
        }
        this.closeAudioResources();
        this.scheduleAutoReconnect(); // 新增自动重连
      }
    },

    async connectToKWSService(stream) {
      if (this.kwsSocket && this.kwsSocket.readyState === WebSocket.OPEN) {
        console.log("[Vue App] KWS WebSocket is already open.");
        return;
      }

      this.kwsSocket = new WebSocket(KWS_SERVER_WEBSOCKET_URL);

      this.kwsSocket.onopen = async () => {
        this.statusMessage = 'KWS服务已连接，准备启动音频处理...';
        this.connectionStatus = 'connected'; // 新增状态更新
        this.systemHealth.kwsConnected = true; // 新增状态更新
        console.log('[Vue App] WebSocket connection to KWS service established. Attempting to setup AudioWorklet.');

        try {
          console.log('[Vue App] AudioContext state:', this.audioContext.state);
          if (!this.microphoneStream || !this.microphoneStream.active) {
            console.error('[Vue App] Microphone stream is not active or not available before setting up AudioWorklet.');
            this.statusMessage = "错误：麦克风流无效。";
            if (this.kwsSocket) this.kwsSocket.close();
            return;
          }
          console.log('[Vue App] Microphone stream is active:', this.microphoneStream.active);

          console.log('[Vue App] Attempting to add AudioWorklet module from /js/kws-audioworklet.js');
          await this.audioContext.audioWorklet.addModule('/js/kws-audioworklet.js');
          console.log('[Vue App] AudioWorklet module added successfully.');

          const sourceNode = this.audioContext.createMediaStreamSource(stream);
          console.log('[Vue App] MediaStreamSourceNode created.');

          const plainProcessorOptions = {
            inputSampleRate: this.processorOptions.inputSampleRate,
            inputChannels: this.processorOptions.inputChannels,
            targetSampleRate: this.processorOptions.targetSampleRate,
            targetChannels: this.processorOptions.targetChannels
          };

          this.audioProcessorNode = new AudioWorkletNode(this.audioContext, 'kws-audio-processor', {
            processorOptions: plainProcessorOptions
          });
          console.log('[Vue App] AudioWorkletNode "kws-audio-processor" created with options:', this.processorOptions);

          this.audioProcessorNode.port.onmessage = (event) => {
            const audioChunkArrayBuffer = event.data;
            if (!this.isAwoken && this.kwsSocket && this.kwsSocket.readyState === WebSocket.OPEN) {
              this.kwsSocket.send(audioChunkArrayBuffer);
            } else if (this.isAwoken && this.isRecording) {
              this.llmAudioChunks.push(audioChunkArrayBuffer);
            }
          };
          console.log('[Vue App] AudioWorkletNode onmessage handler set up.');

          sourceNode.connect(this.audioProcessorNode);
          console.log('[Vue App] MediaStreamSourceNode connected to AudioWorkletNode.');

          this.statusMessage = `KWS服务运行中，等待唤醒词"${KWS_WAKE_WORD}"...`;
          console.log('[Vue App] KWS Audio setup complete.');

        } catch (workletError) {
          console.error("[Vue App] CRITICAL ERROR setting up AudioWorklet for KWS within onopen:", workletError);
          this.statusMessage = "KWS音频处理模块加载失败。请检查控制台错误！";
          this.connectionStatus = 'error'; // 新增状态更新
          if (this.kwsSocket) {
            console.log("[Vue App] Closing WebSocket due to AudioWorklet setup error.");
            this.kwsSocket.close();
          }
        }
      };

      this.kwsSocket.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);
          console.log('[Vue App] Received from KWS_SV server:', messageData);

          if (messageData.event === "wakeup_success") {
            if (messageData.kws_keyword === KWS_WAKE_WORD && messageData.speaker_verified === true) {
              this.handleWakeWordVerified(messageData.kws_keyword, messageData.sv_score, messageData.kws_confidence);
            } else {
              console.warn('[Vue App] Received wakeup_success but keyword mismatch or speaker_verified is not true:', messageData);
            }
          } else if (messageData.event === "kws_detected_sv_failed") {
            const kwsKeyword = messageData.kws_keyword || "关键词";
            const svScore = messageData.sv_score !== undefined ? messageData.sv_score.toFixed(3) : 'N/A';
            const kwsConfidence = messageData.kws_confidence !== undefined ? messageData.kws_confidence.toFixed(3) : 'N/A';

            // 改为心语发言而不是系统警告
            const warningMsg = `检测到"${kwsKeyword}"，但声纹验证失败，请确保是注册用户在清晰说话。`;
            this.addMessageToChat(warningMsg, 'xinyu');
            console.warn(`[Vue App] KWS detected (${kwsKeyword}), but Speaker Verification FAILED. Score: ${svScore}`);

          } else if (messageData.error) {
            console.error('[Vue App] KWS_SV Server Error:', messageData.error);
            this.statusMessage = `KWS服务错误: ${messageData.error}`;
            // 改为心语发言而不是系统错误
            this.addMessageToChat(`服务连接出现问题: ${messageData.error}`, 'xinyu');
          } else {
            console.log('[Vue App] Received unhandled message type or structure from KWS_SV server:', messageData);
          }
        } catch (e) {
          console.warn('[Vue App] 收到非JSON或无法解析的KWS_SV消息:', event.data, e);
          // 改为心语发言而不是系统错误
          this.addMessageToChat('收到无法解析的服务器消息。', 'xinyu');
        }
      };

      this.kwsSocket.onerror = (error) => {
        this.statusMessage = 'KWS服务连接发生错误。';
        this.connectionStatus = 'error'; // 新增状态更新
        this.systemHealth.kwsConnected = false; // 新增状态更新
        console.error('[Vue App] WebSocket error with KWS service:', error);
        this.scheduleAutoReconnect(); // 新增自动重连
      };

      this.kwsSocket.onclose = (event) => {
        this.statusMessage = 'KWS服务连接已断开。';
        this.connectionStatus = 'disconnected'; // 新增状态更新
        this.systemHealth.kwsConnected = false; // 新增状态更新
        console.log('[Vue App] WebSocket connection to KWS service closed. Reason:', event.reason, `Code: ${event.code}`, `Was clean: ${event.wasClean}`);
        this.isAwoken = false;
        this.closeAudioProcessor();
        this.scheduleAutoReconnect(); // 新增自动重连
      };
    },

    handleWakeWordVerified(keyword, svScore = null, kwsConfidence = null) {
      if (this.isAwoken || this.isProcessing || this.isRecording) {
        console.log(`[Vue App] KWS: '${keyword}' detected, but system is busy or already awoken.`);
        return;
      }
      this.isAwoken = true;
      const svScoreMsg = svScore !== null ? ` (声纹得分: ${svScore.toFixed(3)})` : '';
      const kwsConfMsg = kwsConfidence !== null ? ` (KWS置信度: ${kwsConfidence.toFixed(3)})` : '';

      this.statusMessage = `"${keyword}"收到${kwsConfMsg}${svScoreMsg}！身份已确认，请说出您的指令。`;

      // 让心语发消息确认身份并唤醒
      this.addMessageToChat(`我听到了"${keyword}"，身份已确认！请说出您的指令。`, 'xinyu');
      console.log(`[Vue App] 心语已通过关键词 "${keyword}" 并成功验证声纹唤醒.`);

      this.handleRecordingStart();
    },

    resumeKwsListening() {
      console.log('[Vue App] Attempting to resume KWS listening.');
      this.isAwoken = false;
      this.isRecording = false;
      this.isProcessing = false;

      if (this.audioProcessorNode && this.audioProcessorNode.port) {
        this.audioProcessorNode.port.postMessage({ command: 'resume' });
        this.statusMessage = `KWS服务运行中，等待唤醒词"${KWS_WAKE_WORD}"...`;
        console.log('[Vue App] Sent RESUME command to AudioWorklet.');
      } else {
        this.statusMessage = 'KWS无法恢复，音频处理器未就绪。';
        console.warn('[Vue App] Cannot send RESUME: audioProcessorNode or port not available. Re-initializing KWS might be needed if disconnected.');
      }
    },

    // --- STT/Emotion/LLM ---（修改去掉不必要的系统消息）
    handleRecordingStart() {
      if (this.isRecording || this.isProcessing) return;
      this.isRecording = true;
      this.statusMessage = '心语正在聆听您的指令...';
      console.log('[Vue App] 用户指令录音开始，准备收集音频送往LLM API');
      // 移除系统消息：不再显示"（开始聆听指令...）"
    },

    async handleRecordingStop() {
      if (!this.isRecording && !this.isAwoken) {
        console.log('[Vue App] Not recording or not awoken, stop command ignored.');
        return;
      }
      if (!this.isRecording) {
        console.log('[Vue App] Recording already stopped.');
        return;
      }

      this.isRecording = false;
      this.isProcessing = true;
      this.statusMessage = '指令识别中，请稍候...';
      console.log('[Vue App] 用户指令录音结束，准备发送音频。');
      // 移除系统消息：不再显示"（指令录音结束，正在处理...）"

      if (this.llmAudioChunks.length === 0) {
        console.warn('[Vue App] No audio data collected for LLM.');
        // 改为心语发言而不是系统警告
        this.addMessageToChat('未能听清您的指令，请重试。', 'xinyu');
        this.isProcessing = false;
        this.resumeKwsListening();
        return;
      }

      const audioBlob = new Blob(this.llmAudioChunks, { type: 'audio/pcm' });
      this.llmAudioChunks = [];

      try {
        this.statusMessage = '正在发送音频并获取解析结果...';

        const headers = new Headers();
        const sampleRate = this.processorOptions.targetSampleRate;
        const channels = this.processorOptions.targetChannels;
        headers.append('Content-Type', `audio/pcm; rate=${sampleRate}; channels=${channels}`);

        console.log(`[Vue App] Sending audio to LLM API (${LLM_API_BASE_URL}). Size: ${audioBlob.size} bytes. Content-Type: ${headers.get('Content-Type')}`);

        const response = await fetch(LLM_API_BASE_URL, {
          method: 'POST',
          headers: headers,
          body: audioBlob
        });

        if (!response.ok) {
          let errorDetail = `服务器错误 ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
          } catch (e) {
            errorDetail = response.statusText;
          }
          // 改为心语发言而不是系统错误
          this.addMessageToChat(`请求处理失败: ${errorDetail}`, 'xinyu');
          console.error('[Vue App] LLM API Error:', response.status, errorDetail);
          this.isProcessing = false;
          this.resumeKwsListening();
          return;
        }

        // 解析后端返回的JSON数据
        const result = await response.json();
        console.log('[Vue App] Received from LLM API:', result);

        const { asr_text, emotion, llm_response, audio_url } = result;

        if (asr_text) {
          // 去掉"您说："前缀，直接显示用户说的话
          this.addMessageToChat(asr_text, 'user');
        } else {
          // 改为心语发言而不是用户消息
          this.addMessageToChat('（抱歉，未能清晰识别您的语音内容）', 'xinyu');
        }

        if (emotion) {
          // 移除情绪系统消息：不再显示"（心语感知到您的情绪可能为：...）"
          this.showEmotionWithPopup(emotion);
        }

        if (llm_response) {
          this.addMessageToChat(llm_response, 'xinyu');
        } else {
          this.addMessageToChat('嗯...心语暂时不知道怎么回答这个问题。', 'xinyu');
        }

        this.statusMessage = '心语回应完毕。';

        // 如果后端返回了音频URL，则播放它
        if (audio_url) {
          let finalAudioUrl = audio_url;
          if (audio_url.startsWith('/api/') || audio_url.startsWith('/')) {
            finalAudioUrl = `http://10.129.254.87:8300${audio_url}`;
          }
          this.playTTSAudio(finalAudioUrl);
        } else {
          // 移除系统消息：不再显示"（心语没有音频回应）"
          this.statusMessage = '心语回应完毕。';
          this.isProcessing = false;
          this.resumeKwsListening();
        }

      } catch (error) {
        console.error('[Vue App] 处理用户音频或与LLM API通信时出错:', error);
        // 改为心语发言而不是系统错误
        this.addMessageToChat(`处理您的请求时遇到问题: ${error.message}`, 'xinyu');
        this.statusMessage = '发生错误，请重试。';
        this.isProcessing = false;
        this.resumeKwsListening();
      }
    },

    formatEmotion(emotionKey) {
      const emotionMap = {
        "HAPPY": "开心 😊",
        "SAD": "难过 😔",
        "ANGRY": "生气 😠",
        "NEUTRAL": "平静 😐",
        "FEARFUL": "有点小紧张 😟",
        "DISGUSTED": "不太舒服 😒",
        "SURPRISED": "惊讶 😮"
      };
      return emotionMap[emotionKey.toUpperCase()] || emotionKey;
    },

    async playTTSAudio(audioUrl) {
      console.log(`[Vue App] Attempting to play TTS audio from: ${audioUrl}`);
      this.statusMessage = '心语正在回应...';

      const resumeKWSAndResetProcessing = () => {
        console.log('[Vue App] TTS operation finished or failed, resuming KWS and resetting processing.');
        this.isProcessing = false;
        this.resumeKwsListening();
      };

      try {
        console.log(`[Vue App] Creating Audio element with URL: ${audioUrl}`);

        const audio = new Audio(audioUrl);

        audio.onloadstart = () => {
          console.log('[Vue App] Audio loading started.');
        };

        audio.onloadedmetadata = () => {
          console.log('[Vue App] Audio metadata loaded.');
        };
        audio.onprogress = () => {
          console.log('[Vue App] Audio progress event. Buffered:', audio.buffered.length > 0 ? audio.buffered.end(0) : 0, 'Duration:', audio.duration);
        };
        audio.onsuspend = () => {
          console.log('[Vue App] Audio suspend event.');
        };
        audio.onstalled = () => {
          console.log('[Vue App] Audio stalled event.');
        };
        audio.onwaiting = () => {
          console.log('[Vue App] Audio waiting event.');
        };
        audio.onloadeddata = () => {
          console.log('[Vue App] Audio loadeddata event. ReadyState:', audio.readyState);
        };

        audio.oncanplaythrough = () => {
          console.log('[Vue App] Audio can play through.');
          audio.play()
            .then(() => {
              console.log('[Vue App] TTS Audio playback started.');
              this.statusMessage = '心语回应播放中...';
            })
            .catch(e => {
              console.error('[Vue App] Error playing TTS audio:', e);
              // 改为心语发言而不是系统错误
              this.addMessageToChat('播放回应音频失败。', 'xinyu');
              this.statusMessage = '回应音频播放失败。';
              resumeKWSAndResetProcessing();
            });
        };

        audio.onended = () => {
          console.log('[Vue App] TTS Audio playback ended.');
          this.statusMessage = '心语回应完毕。准备再次聆听唤醒词。';
          resumeKWSAndResetProcessing();
        };

        audio.onerror = (e) => {
          console.error('[Vue App] Error loading/playing audio element:', e, audio.error);
          console.error('[Vue App] Attempted URL was:', audio.src);
          let errorMsg = '加载回应音频失败';
          if (audio.error) {
            switch (audio.error.code) {
              case 1: errorMsg += '：音频加载被中止'; break;
              case 2: errorMsg += '：网络错误'; break;
              case 3: errorMsg += '：音频解码失败'; break;
              case 4: errorMsg += '：音频格式不支持'; break;
              default: errorMsg += '：未知错误';
            }
          }
          // 改为心语发言而不是系统错误
          this.addMessageToChat(errorMsg, 'xinyu');
          this.statusMessage = '回应音频加载失败。';
          resumeKWSAndResetProcessing();
        };

        audio.preload = 'auto';
        audio.load();

      } catch (e) {
        console.error('[Vue App] Exception during audio playback setup:', e);
        // 改为心语发言而不是系统错误
        this.addMessageToChat(`音频播放错误: ${e.message}`, 'xinyu');
        this.statusMessage = '回应播放功能异常。';
        resumeKWSAndResetProcessing();
      }
    },

    // ...existing code...

    handleVoiceCloneUpdated(voiceCloneData) {
      this.voiceCloneEnabled = voiceCloneData.enabled;
      this.voiceCloneInfo = voiceCloneData;

      this.appSettings.voiceClone = voiceCloneData;
      this.saveAppSettings();

      if (voiceCloneData.enabled) {
        // 改为心语发言而不是系统消息
        this.addMessageToChat(
          `声音克隆已启用！现在TTS将使用您的声音回应。参考音频时长：${this.formatDuration(voiceCloneData.audioDuration)}`,
          'xinyu'
        );
        this.statusMessage = '声音克隆已启用';
      }

      console.log('[Vue App] Voice clone updated:', voiceCloneData);
    },

    // ...existing code... (保持其余所有方法不变)

    closeAudioProcessor() {
      if (this.audioProcessorNode) {
        try {
          this.audioProcessorNode.port.postMessage('stop');
          this.audioProcessorNode.disconnect();
        } catch (e) {
          console.warn("[Vue App] Error disconnecting audioProcessorNode:", e);
        }
        this.audioProcessorNode = null;
        console.log("[Vue App] AudioProcessorNode resources released.");
      }
    },

    closeAudioResources() {
      console.log("[Vue App] Closing all audio resources.");
      this.closeAudioProcessor();

      if (this.microphoneStream) {
        this.microphoneStream.getTracks().forEach(track => track.stop());
        this.microphoneStream = null;
        console.log("[Vue App] Microphone stream stopped.");
      }
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close().then(() => {
          this.audioContext = null;
          console.log("[Vue App] AudioContext closed.");
        }).catch(e => console.error("[Vue App] Error closing AudioContext:", e));
      } else {
        this.audioContext = null;
      }
      if (this.kwsSocket && (this.kwsSocket.readyState === WebSocket.OPEN || this.kwsSocket.readyState === WebSocket.CONNECTING)) {
        this.kwsSocket.close(1000, "Client shutting down");
      }
      this.kwsSocket = null;

      // 更新系统健康状态
      this.updateSystemHealth();
    },

    // Settings panel management
    toggleSettings() {
      this.showSettings = !this.showSettings;
      if (this.showSettings) {
        this.showNotification('设置面板已打开', 'info');
      }
    },

    handleThemeChanged(theme) {
      this.appSettings.theme = theme;
      this.applyTheme(theme);
      this.saveAppSettings();
    },

    applyTheme(theme) {
      document.body.classList.remove('light-theme', 'dark-theme');

      let themeToApply;
      if (theme === 'auto') {
        themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        themeToApply = theme;
      }

      document.body.classList.add(`${themeToApply}-theme`);

      const root = document.documentElement;
      if (themeToApply === 'dark') {
        this.applyDarkThemeVariables(root);
      } else {
        this.applyLightThemeVariables(root);
      }

      console.log(`Applied theme: ${themeToApply}`);
    },

    applyDarkThemeVariables(root) {
      root.style.setProperty('--bg-primary', '#1a202c');
      root.style.setProperty('--bg-secondary', '#2d3748');
      root.style.setProperty('--bg-tertiary', '#4a5568');
      root.style.setProperty('--text-primary', '#f7fafc');
      root.style.setProperty('--text-secondary', '#e2e8f0');
      root.style.setProperty('--text-tertiary', '#cbd5e0');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--glass-bg', 'rgba(26, 32, 44, 0.8)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
    },

    applyLightThemeVariables(root) {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f7fafc');
      root.style.setProperty('--bg-tertiary', '#edf2f7');
      root.style.setProperty('--text-primary', '#2d3748');
      root.style.setProperty('--text-secondary', '#4a5568');
      root.style.setProperty('--text-tertiary', '#718096');
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.2)');
    },

    setupThemeListener() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addListener((e) => {
        if (this.appSettings.theme === 'auto') {
          this.applyTheme('auto');
        }
      });
    },

    handleAnimationsChanged(enabled) {
      this.appSettings.animatedBackground = enabled;
      this.saveAppSettings();
    },

    handleVolumeChanged(volume) {
      this.appSettings.volume = volume / 100;
      this.updateSystemVolume(this.appSettings.volume);
      this.saveAppSettings();
    },

    handleSpeechRateChanged(rate) {
      this.appSettings.speechRate = rate;
      this.saveAppSettings();
    },

    handleMicSensitivityChanged(sensitivity) {
      this.appSettings.micSensitivity = sensitivity / 10;
      this.saveAppSettings();
    },

    handleAutoScrollChanged(enabled) {
      this.appSettings.autoScroll = enabled;
      this.saveAppSettings();
    },

    handleEmotionDisplayChanged(enabled) {
      this.appSettings.showEmotions = enabled;
      this.saveAppSettings();
    },

    handleShortcutsDisplayChanged(enabled) {
      this.appSettings.keyboardShortcuts = enabled;
      this.showKeyboardHelp = enabled;
      this.saveAppSettings();
    },

    handleSettingsReset() {
      this.appSettings = {
        theme: 'auto',
        volume: 0.8,
        micSensitivity: 0.7,
        autoPlay: true,
        keyboardShortcuts: true,
        showEmotions: true,
        animatedBackground: true,
        autoScroll: true,
        speechRate: 1.0,
        voiceClone: null,
        enableNotifications: true,
        soundEffects: true,
        autoReconnect: true,
        debugMode: false
      };

      this.voiceCloneEnabled = false;
      this.voiceCloneInfo = null;

      this.applyTheme(this.appSettings.theme);
      this.saveAppSettings();

      this.showNotification('所有设置已重置，包括声音克隆', 'info');
    },

    handleSettingsSaved(settings) {
      console.log('Settings saved:', settings);
    },

    saveAppSettings() {
      localStorage.setItem('xinyu-settings', JSON.stringify(this.appSettings));
    },

    loadSavedSettings() {
      try {
        const saved = localStorage.getItem('xinyu-settings');
        if (saved) {
          const settings = JSON.parse(saved);
          this.appSettings = {
            ...this.appSettings,
            ...settings
          };

          if (settings.voiceClone) {
            this.voiceCloneEnabled = settings.voiceClone.enabled || false;
            this.voiceCloneInfo = settings.voiceClone;
          }

          this.applyTheme(this.appSettings.theme);
        } else {
          this.applyTheme(this.appSettings.theme);
        }
      } catch (error) {
        console.warn('Failed to load saved settings:', error);
        this.applyTheme(this.appSettings.theme);
      }
    },

    // 情绪弹窗相关方法
    showEmotionWithPopup(emotion) {
      if (!this.appSettings.showEmotions || !emotion) return;

      if (this.emotionPopupTimer) {
        clearTimeout(this.emotionPopupTimer);
        this.emotionPopupTimer = null;
      }

      this.currentEmotion = emotion;
      this.showEmotionPopup = true;

      this.emotionPopupTimer = setTimeout(() => {
        this.hideEmotionPopup();
      }, 5000);

      console.log(`[Vue App] 显示情绪弹窗: ${emotion}`);
    },

    hideEmotionPopup() {
      this.showEmotionPopup = false;
      if (this.emotionPopupTimer) {
        clearTimeout(this.emotionPopupTimer);
        this.emotionPopupTimer = null;
      }
    },

    formatDuration(seconds) {
      if (!seconds) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // === 新增美化功能方法 ===

    // 系统健康监控
    updateSystemHealth() {
      this.systemHealth = {
        microphoneActive: !!(this.microphoneStream && this.microphoneStream.active),
        kwsConnected: !!(this.kwsSocket && this.kwsSocket.readyState === WebSocket.OPEN),
        audioContextActive: !!(this.audioContext && this.audioContext.state === 'running')
      };

      // 更新连接状态
      if (this.systemHealth.kwsConnected && this.systemHealth.microphoneActive) {
        this.connectionStatus = 'connected';
      } else if (this.kwsSocket && this.kwsSocket.readyState === WebSocket.CONNECTING) {
        this.connectionStatus = 'connecting';
      } else {
        this.connectionStatus = 'disconnected';
      }
    },

    // 音效系统
    playNotificationSound() {
      if (!this.appSettings.soundEffects) return;

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1 * this.appSettings.volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        console.warn('无法播放提示音:', error);
      }
    },

    // 自动重连逻辑
    scheduleAutoReconnect() {
      if (!this.appSettings.autoReconnect) return;

      setTimeout(async () => {
        if (!this.isSystemHealthy && !this.isProcessing) {
          console.log('[Vue App] 尝试自动重连...');
          await this.reconnectServices();
        }
      }, 5000);
    },
    async restartTTSService() {
      try {
        this.statusMessage = '正在重启语音生成服务...';
        this.showNotification('正在重启语音生成服务，请稍候...', 'info');

        const response = await fetch('http://10.129.237.27:9880/control?command=restart', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // 清除声音克隆状态
          this.voiceCloneEnabled = false;
          this.voiceCloneInfo = null;
          this.appSettings.voiceClone = null;
          this.saveAppSettings();

          this.statusMessage = '语音生成服务重启成功';
          this.showNotification('语音生成服务重启成功，声音克隆已取消', 'success');
          this.addMessageToChat('语音生成服务已重启，声音克隆状态已清除。', 'xinyu');

          try {
            const responseData = await response.json();
            console.log('[Vue App] TTS服务重启响应:', responseData);
          } catch (e) {
            // 如果响应不是JSON格式也没关系
            console.log('[Vue App] TTS服务重启成功，响应为非JSON格式');
          }
        } else {
          let errorMsg = `重启失败 (${response.status})`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.detail || errorData.message || errorMsg;
          } catch (e) {
            errorMsg = response.statusText || errorMsg;
          }

          this.statusMessage = '语音生成服务重启失败';
          this.showNotification(`重启语音生成服务失败: ${errorMsg}`, 'error');
          console.error('[Vue App] TTS服务重启失败:', response.status, errorMsg);
        }
      } catch (error) {
        this.statusMessage = '重启服务时发生错误';
        this.showNotification(`重启语音生成服务时出错: ${error.message}`, 'error');
        console.error('[Vue App] 重启TTS服务时发生错误:', error);
      }
    },

    // 处理TTS服务重启事件
    handleTTSServiceRestart() {
      this.restartTTSService();
    },

    // Toast 提示系统
    getToastIcon() {
      const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
      };
      return icons[this.toastType] || icons.info;
    },

    showStatusToast(type, title, message) {
      this.toastType = type;
      this.toastTitle = title;
      this.toastMessage = message;
      this.showStatusToast = true;

      setTimeout(() => {
        this.hideStatusToast();
      }, 4000);
    },

    hideStatusToast() {
      this.showStatusToast = false;
    },

    // 连接状态管理
    getConnectionText() {
      const statusTexts = {
        connected: '已连接',
        connecting: '连接中',
        disconnected: '未连接',
        error: '连接错误'
      };
      return statusTexts[this.connectionStatus] || '未知状态';
    }

  },

  mounted() {
    // Load saved settings
    this.loadSavedSettings();

    // 设置主题监听器
    this.setupThemeListener();

    // Add keyboard event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    // 定期更新系统健康状态
    setInterval(() => {
      this.updateSystemHealth();
    }, 5000);

    // Show welcome notification
    setTimeout(() => {
      this.showNotification('心语已启动，请说出"小云小云"来唤醒我', 'info');
    }, 1000);
  },

  beforeUnmount() {
    this.closeAudioResources();

    // Remove keyboard event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);

    // 清理情绪弹窗定时器
    if (this.emotionPopupTimer) {
      clearTimeout(this.emotionPopupTimer);
    }
  }
};
</script>

<style>
/* Enhanced Global Styles */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f7fafc;
  --bg-tertiary: #edf2f7;
  --text-primary: #2d3748;
  --text-secondary: #4a5568;
  --text-tertiary: #718096;
  --border-color: rgba(0, 0, 0, 0.1);
  --shadow-color: rgba(0, 0, 0, 0.1);
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(255, 255, 255, 0.2);

  /* 新增美化变量 */
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --accent-gradient: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #3b82f6;
  --glass-light: rgba(255, 255, 255, 0.15);
  --glass-strong: rgba(255, 255, 255, 0.25);
  --shimmer-gradient: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--primary-gradient);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(103, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 107, 107, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* Enhanced App Container */
#xinyu-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

#xinyu-app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%,
      rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
  z-index: 1;
}

/* Enhanced Background Decorations */
.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  animation: float 6s ease-in-out infinite;
  filter: blur(1px);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -75px;
  left: -75px;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  right: 10%;
  animation-delay: 4s;
}

/* New particle effects */
.decoration-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: particleFloat 8s linear infinite;
}

.particle-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.particle-2 {
  top: 60%;
  right: 15%;
  animation-delay: 3s;
}

.particle-3 {
  bottom: 30%;
  left: 70%;
  animation-delay: 6s;
}

/* Wave decorations */
.decoration-wave {
  position: absolute;
  height: 200px;
  background: linear-gradient(45deg,
      rgba(103, 126, 234, 0.1) 0%,
      rgba(118, 75, 162, 0.1) 50%,
      rgba(255, 107, 107, 0.1) 100%);
  border-radius: 50%;
  filter: blur(40px);
  animation: waveFloat 12s ease-in-out infinite;
}

.wave-1 {
  width: 300px;
  top: 10%;
  left: -150px;
  animation-delay: 0s;
}

.wave-2 {
  width: 250px;
  bottom: 10%;
  right: -125px;
  animation-delay: 6s;
}

/* Enhanced Animations */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.3;
  }

  50% {
    transform: translateY(-20px) scale(1.05);
    opacity: 0.6;
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes waveFloat {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.3;
  }

  50% {
    transform: translateY(-30px) scale(1.1);
    opacity: 0.6;
  }
}

/* Enhanced Header */
.app-header {
  background: linear-gradient(135deg,
      rgba(103, 126, 234, 0.95) 0%,
      rgba(118, 75, 162, 0.95) 50%,
      rgba(255, 107, 107, 0.95) 100%);
  color: white;
  padding: 25px 30px;
  position: relative;
  z-index: 10;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.header-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%,
      rgba(255, 255, 255, 0.1) 100%);
  animation: headerShimmer 3s ease-in-out infinite;
}

@keyframes headerShimmer {

  0%,
  100% {
    transform: translateX(-100%);
  }

  50% {
    transform: translateX(100%);
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
  position: relative;
  z-index: 2;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 2.5em;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  animation: logoBreath 3s ease-in-out infinite;
}

.logo-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: logoRingRotate 8s linear infinite;
}

.logo-ring::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 50%;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transform: translateX(-50%);
}

@keyframes logoBreath {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes logoRingRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.title-container {
  margin-left: 15px;
}

.title-container h1 {
  margin: 0;
  font-size: 2.2em;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(45deg, #ffffff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  letter-spacing: 1px;
}

/* Enhanced Status Section */
.status-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.status-wave {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent);
  animation: statusWave 2s ease-in-out infinite;
}

@keyframes statusWave {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  animation: status-pulse 2s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

.status-waiting .status-dot {
  background: #f59e0b;
}

.status-awoken .status-dot {
  background: #3b82f6;
}

.status-recording .status-dot {
  background: #ef4444;
  animation: recording-pulse 1s ease-in-out infinite;
}

.status-processing .status-dot {
  background: #8b5cf6;
  animation: processing-pulse 0.8s ease-in-out infinite;
}

@keyframes status-pulse {

  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  }

  50% {
    opacity: 0.8;
    box-shadow: 0 0 0 6px rgba(74, 222, 128, 0);
  }
}

@keyframes recording-pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.2);
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

@keyframes processing-pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.1);
    box-shadow: 0 0 0 6px rgba(139, 92, 246, 0);
  }
}

/* Enhanced Settings Button */
.settings-button {
  position: relative;
  padding: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.settings-button:hover .button-glow {
  width: 100px;
  height: 100px;
}

.settings-button:hover {
  transform: rotate(90deg) scale(1.1);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Main Content */
.app-main {
  flex: 1;
  position: relative;
  z-index: 5;
  overflow: hidden;
}

/* Enhanced Footer */
.app-footer {
  padding: 25px 30px;
  background: linear-gradient(135deg,
      rgba(249, 250, 251, 0.8) 0%,
      rgba(243, 244, 246, 0.8) 100%);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  position: relative;
  z-index: 10;
  min-height: 100px;
  justify-content: center;
  border-radius: 0 0 20px 20px;
}

.footer-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent);
}

/* Enhanced Processing Indicator */
.processing-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  margin: 20px;
  position: relative;
  overflow: hidden;
}

.processing-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
      transparent,
      rgba(103, 126, 234, 0.2),
      transparent);
  animation: processingShimmer 2s ease-in-out infinite;
}

@keyframes processingShimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.processing-animation {
  position: relative;
  z-index: 2;
}

.processing-dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.processing-dots .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 20px rgba(103, 126, 234, 0.5);
  animation: processingBounce 1.4s ease-in-out infinite;
}

.processing-dots .dot:nth-child(1) {
  animation-delay: 0s;
}

.processing-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.processing-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes processingBounce {

  0%,
  60%,
  100% {
    transform: translateY(0);
  }

  30% {
    transform: translateY(-15px);
  }
}

.processing-text {
  font-size: 16px;
  font-weight: 500;
  color: #4a5568;
  text-align: center;
  position: relative;
  z-index: 2;
}

/* Enhanced Recording Status */
.recording-status {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  padding: 15px 25px;
  border-radius: 20px;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  color: #6b7280;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.recording-status.active {
  background: linear-gradient(135deg,
      rgba(255, 107, 107, 0.9) 0%,
      rgba(238, 90, 82, 0.9) 100%);
  color: white;
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.4);
}

.recording-pulse {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }

  50% {
    opacity: 0.7;
    transform: translateY(-50%) scale(1.2);
  }
}

/* Enhanced Keyboard Help */
.keyboard-help {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: linear-gradient(135deg,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(26, 32, 44, 0.9) 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 12px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.keyboard-help.show {
  opacity: 1;
  transform: translateY(0);
}

.keyboard-help-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.help-icon {
  font-size: 14px;
}

.help-title {
  font-weight: 600;
  font-size: 13px;
}

.keyboard-help-content {
  margin-bottom: 10px;
}

.keyboard-help-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.keyboard-help-item:last-child {
  margin-bottom: 0;
}

.keyboard-key {
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.1) 100%);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 24px;
  text-align: center;
}

.help-description {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.keyboard-help-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.help-close-hint {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

/* Enhanced Floating Action Buttons */
.floating-actions {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 100;
}

.fab-microphone,
.fab-status {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.fab-microphone {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.fab-microphone:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
}

.fab-status {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.fab-status.status-connected {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.fab-status.status-connecting {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.fab-status.status-disconnected {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.fab-status.status-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.fab-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.fab-microphone:active .fab-ripple {
  width: 80px;
  height: 80px;
}

.fab-status-ring {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), transparent, rgba(255, 255, 255, 0.3));
  animation: statusRingRotate 2s linear infinite;
}

.fab-status-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  transform: translate(-50%, -50%);
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusRingRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes statusPulse {

  0%,
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.fab-bounce-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fab-bounce-enter-from {
  opacity: 0;
  transform: scale(0) translateY(100px);
}

/* Enhanced Status Toast */
.status-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  min-width: 320px;
  max-width: 420px;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(248, 250, 252, 0.98) 100%);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  padding: 0;
  overflow: hidden;
  position: relative;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  margin-left: 12px;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
}

.status-toast.info {
  border-left: 4px solid var(--info-color);
}

.status-toast.success {
  border-left: 4px solid var(--success-color);
}

.status-toast.warning {
  border-left: 4px solid var(--warning-color);
}

.status-toast.error {
  border-left: 4px solid var(--error-color);
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Enhanced Global Progress Bar */
.global-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 10000;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg,
      #667eea 0%,
      #764ba2 50%,
      #ff6b6b 100%);
  animation: progressFill 2s ease-in-out infinite;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent);
  animation: progressGlow 2s ease-in-out infinite;
}

@keyframes progressFill {
  0% {
    width: 0%;
    left: 0%;
  }

  50% {
    width: 70%;
    left: 15%;
  }

  100% {
    width: 0%;
    left: 100%;
  }
}

@keyframes progressGlow {
  0% {
    left: -30%;
  }

  100% {
    left: 100%;
  }
}

/* Enhanced Connection Status */
.connection-status {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.connection-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6b7280;
  animation: connectionPulse 2s ease-in-out infinite;
}

.connection-status.connected .connection-dot {
  background: #10b981;
}

.connection-status.connecting .connection-dot {
  background: #f59e0b;
  animation: connectingBlink 1s ease-in-out infinite;
}

.connection-status.disconnected .connection-dot {
  background: #6b7280;
}

.connection-status.error .connection-dot {
  background: #ef4444;
}

@keyframes connectionPulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes connectingBlink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

/* Enhanced Notification System */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  min-width: 320px;
  max-width: 420px;
  background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(248, 250, 252, 0.98) 100%);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  padding: 0;
  transform: translateX(120%);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.notification.show {
  transform: translateX(0);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 18px 24px;
  gap: 14px;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-body {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.notification-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

.notification-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
}

/* Notification Types with Enhanced Styling */
.notification-info {
  border-left: 4px solid var(--info-color);
}

.notification-success {
  border-left: 4px solid var(--success-color);
}

.notification-warning {
  border-left: 4px solid var(--warning-color);
}

.notification-error {
  border-left: 4px solid var(--error-color);
}

/* Enhanced Transitions */
.processing-fade-enter-active,
.processing-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.processing-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.processing-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.1);
}

.status-fade-enter-active,
.status-fade-leave-active {
  transition: all 0.3s ease;
}

.status-fade-enter-from,
.status-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Dark Theme Enhancements */
.dark-theme #xinyu-app {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.dark-theme .processing-indicator {
  background: linear-gradient(135deg,
      rgba(26, 32, 44, 0.95) 0%,
      rgba(45, 55, 72, 0.95) 100%);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .processing-text {
  color: #e2e8f0;
}

.dark-theme .app-footer {
  background: linear-gradient(135deg,
      rgba(26, 32, 44, 0.8) 0%,
      rgba(45, 55, 72, 0.8) 100%);
}

.dark-theme .recording-status {
  background: linear-gradient(135deg,
      rgba(45, 55, 72, 0.9) 0%,
      rgba(74, 85, 104, 0.9) 100%);
  color: #e2e8f0;
}

.dark-theme .notification {
  background: linear-gradient(135deg,
      rgba(26, 32, 44, 0.98) 0%,
      rgba(45, 55, 72, 0.98) 100%);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .notification-title {
  color: #f7fafc;
}

.dark-theme .notification-text {
  color: #e2e8f0;
}

.dark-theme .notification-close {
  color: #a0aec0;
}

.dark-theme .notification-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.dark-theme .status-toast {
  background: linear-gradient(135deg,
      rgba(26, 32, 44, 0.98) 0%,
      rgba(45, 55, 72, 0.98) 100%);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .toast-title {
  color: #f7fafc;
}

.dark-theme .toast-message {
  color: #e2e8f0;
}

.dark-theme .toast-close {
  color: #a0aec0;
}

.dark-theme .toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

/* Performance Optimizations */
.decoration-particle,
.decoration-wave,
.logo-ring,
.status-wave,
.button-glow,
.processing-shimmer,
.fab-ripple,
.progress-fill,
.progress-glow {
  will-change: transform;
  transform: translateZ(0);
}

/* Responsive Design Improvements */
@media (max-width: 768px) {
  #xinyu-app {
    margin: 10px;
    border-radius: 16px;
  }

  .logo-icon {
    font-size: 2em;
  }

  .title-container h1 {
    font-size: 1.8em;
  }

  .subtitle {
    font-size: 0.8em;
  }

  .decoration-wave {
    height: 150px;
  }

  .wave-1 {
    width: 250px;
  }

  .wave-2 {
    width: 200px;
  }

  .notification {
    min-width: 280px;
    max-width: 320px;
    top: 10px;
    right: 10px;
  }

  .status-toast {
    min-width: 280px;
    max-width: 320px;
    top: 10px;
    right: 10px;
  }

  .keyboard-help {
    bottom: 10px;
    left: 10px;
  }

  .floating-actions {
    bottom: 20px;
    right: 20px;
  }

  .fab-microphone,
  .fab-status {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    gap: 10px;
  }

  .status-section {
    width: 100%;
    justify-content: center;
  }

  .processing-indicator {
    margin: 10px;
  }

  .app-footer {
    padding: 20px 15px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .decoration-circle,
  .decoration-particle,
  .decoration-wave,
  .logo-ring,
  .status-wave,
  .processing-shimmer,
  .header-glow {
    animation: none !important;
  }
}

/* Enhanced Focus Styles for Accessibility */
button:focus-visible,
.settings-button:focus-visible,
.fab-microphone:focus-visible,
.fab-status:focus-visible {
  outline: 2px solid #3182ce;
  outline-offset: 2px;
}

/* Smooth Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg,
      rgba(103, 126, 234, 0.6) 0%,
      rgba(118, 75, 162, 0.6) 100%);
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg,
      rgba(103, 126, 234, 0.8) 0%,
      rgba(118, 75, 162, 0.8) 100%);
}

/* High DPI Support */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
  .logo-icon {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Print Styles */
@media print {

  .floating-actions,
  .keyboard-help,
  .notification,
  .status-toast,
  .global-progress,
  .connection-status {
    display: none !important;
  }

  #xinyu-app {
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>