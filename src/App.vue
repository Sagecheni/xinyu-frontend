<template>
  <div id="xinyu-app">
    <!-- Splash Screen -->
    <SplashScreen v-if="showSplash" @splash-finished="handleSplashFinished" />
    
    <!-- Main App Content -->
    <div v-else class="main-app-content">
      <!-- Background Decorations -->
      <div class="background-decorations">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>

      <!-- Header -->
      <header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <div class="logo-icon">🤖</div>
            <h1>心语</h1>
          </div>
          <div class="status-section">
            <div class="status-indicator" :class="getStatusClass()">
              <div class="status-dot"></div>
              <span class="status-text">{{ statusMessage }}</span>
            </div>
            <button class="settings-button" @click="toggleSettings" title="设置">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="none" stroke="currentColor" stroke-width="2"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.0a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Chat Interface -->
      <main class="app-main">
        <ChatInterface :messages="messages" />
      </main>

      <!-- Footer Controls -->
      <footer class="app-footer">
        <transition name="processing-fade" mode="out-in">
          <div v-if="isProcessing" class="processing-indicator" key="processing">
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
            <MicrophoneButton 
              v-if="isAwoken" 
              @recording-start="handleRecordingStart"
              @recording-stop="handleRecordingStop" 
              :is-recording="isRecording" 
              :is-disabled="isProcessing" 
            />
            
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
      <SettingsPanel 
        v-if="showSettings" 
        @close="toggleSettings"
        @settings-changed="handleSettingsChanged"
        :current-settings="appSettings"
      />
      
      <!-- Keyboard Shortcuts Help -->
      <div class="keyboard-help" :class="{ show: showKeyboardHelp }">
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
    </div>
  </div>
</template>

<script>
import ChatInterface from './components/ChatInterface.vue'; // 确保路径正确
import MicrophoneButton from './components/MicrophoneButton.vue'; // 确保路径正确
import SplashScreen from './components/SplashScreen.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const KWS_SERVER_WEBSOCKET_URL = 'ws://10.129.254.87:8000/ws/kws_sv'; // 【重要】替换为你的KWS服务器实际IP和端口
const KWS_WAKE_WORD = "小云小云"; // 你的唤醒词
const LLM_API_BASE_URL = 'http://10.129.254.87:8300/stream_audio';
const LLM_AUDIO_STREAM_URL = `http://10.129.254.87:8300/api/audio`; // POST音频到此端点

export default {
  name: 'App',
  components: {
    ChatInterface,
    MicrophoneButton,
    SplashScreen,
    SettingsPanel
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
      isRecording: false,      // 指的是用户指令的录制
      isProcessing: false,     // LLM 是否正在处理
      isAwoken: false,         // KWS 是否已唤醒

      // App Settings
      appSettings: {
        theme: 'auto',
        volume: 0.8,
        micSensitivity: 0.7,
        autoPlay: true,
        keyboardShortcuts: true,
        showEmotions: true,
        animatedBackground: true
      },

      kwsSocket: null,
      audioContext: null,
      microphoneStream: null,
      audioProcessorNode: null,
      processorOptions: null,  // 将存储传递给 AudioWorklet 的选项

      TARGET_SAMPLE_RATE: 16000, // KWS 服务器期望的采样率
      TARGET_CHANNELS: 1,       // KWS 服务器期望的声道数
      llmAudioChunks: [],      // 用于存储音频数据块
    };
  },
  methods: {
    // Splash screen handler
    handleSplashFinished() {
      this.showSplash = false;
      
      // Show keyboard help briefly after splash
      setTimeout(() => {
        this.showKeyboardHelp = true;
        setTimeout(() => {
          this.showKeyboardHelp = false;
        }, 5000);
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

    // Show notification
    showNotification(message, type = 'info') {
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

    // Keyboard shortcuts
    handleKeyDown(event) {
      // Space bar for quick recording (when awoken)
      if (event.code === 'Space' && this.isAwoken && !this.isRecording && !this.isProcessing) {
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
      
      // Ctrl/Cmd + R to reconnect
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyR') {
        event.preventDefault();
        this.reconnectServices();
        this.showNotification('正在重新连接服务...', 'info');
      }
    },

    handleKeyUp(event) {
      // Space bar release
      if (event.code === 'Space' && this.isRecording) {
        event.preventDefault();
        this.handleRecordingStop();
      }
    },

    // Reconnect services
    async reconnectServices() {
      try {
        this.statusMessage = '正在重新连接...';
        if (this.kwsSocket) {
          this.kwsSocket.close();
        }
        await this.initializeMicrophoneAndKWS();
        this.showNotification('重新连接成功', 'success');
      } catch (error) {
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

    addMessageToChat(text, sender, emotion = null) {
      this.messages.push({
        id: `${sender}-${Date.now()}`,
        text,
        sender,
        emotion,
        timestamp: new Date(),
      });
      this.$nextTick(() => {
        const chatContainer = document.querySelector('.chat-messages-container'); // 假设你的 ChatInterface.vue 中有这个类
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      });
    },

    async initializeMicrophoneAndKWS() {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        console.log("[Vue App] KWS and Mic already initialized or in process.");
        return;
      }
      this.statusMessage = '正在请求麦克风权限...';
      try {
        this.microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: { ideal: this.TARGET_SAMPLE_RATE }, // 尝试请求理想采样率
            channelCount: { ideal: this.TARGET_CHANNELS },   // 尝试请求理想声道数
            echoCancellation: true,
            noiseSuppression: true
          },
          video: false
        });
        this.statusMessage = '麦克风已授权，正在配置音频环境...';

        this.audioContext = new AudioContext(); // 不强制指定采样率，让浏览器选择

        // 恢复 AudioContext (如果需要用户交互)
        if (this.audioContext.state === 'suspended') {
          console.log('[Vue App] AudioContext is suspended, attempting to resume...');
          await this.audioContext.resume();
          console.log('[Vue App] AudioContext resumed. State:', this.audioContext.state);
        }

        const actualContextSampleRate = this.audioContext.sampleRate;
        const audioTrack = this.microphoneStream.getAudioTracks()[0];
        const trackSettings = audioTrack.getSettings();
        // 如果 trackSettings.sampleRate 未定义，则回退到 audioContext.sampleRate
        const actualTrackSampleRate = trackSettings.sampleRate || actualContextSampleRate;
        const actualTrackChannels = trackSettings.channelCount || this.TARGET_CHANNELS;


        console.log(`[Vue App] Mic Track SR: ${actualTrackSampleRate}, Channels: ${actualTrackChannels}. AudioContext SR: ${actualContextSampleRate}. KWS Target SR: ${this.TARGET_SAMPLE_RATE}Hz, Target Channels: ${this.TARGET_CHANNELS}`);
        this.statusMessage = `麦克风 SR: ${actualTrackSampleRate}, 音频环境 SR: ${actualContextSampleRate}. KWS目标: ${this.TARGET_SAMPLE_RATE}Hz`;

        this.processorOptions = {
          inputSampleRate: actualTrackSampleRate,    // AudioWorklet 输入的实际采样率
          inputChannels: actualTrackChannels,        // AudioWorklet 输入的实际声道数
          targetSampleRate: this.TARGET_SAMPLE_RATE, // KWS 服务器期望的采样率
          targetChannels: this.TARGET_CHANNELS       // KWS 服务器期望的声道数
        };

        await this.connectToKWSService(this.microphoneStream);

      } catch (error) {
        console.error('[Vue App] 麦克风权限获取或KWS初始化失败:', error);
        this.statusMessage = '麦克风错误或KWS初始化失败！';
        if (error.name === "OverconstrainedError") {
          this.statusMessage = `无法获取期望的音频格式 (${this.TARGET_SAMPLE_RATE}Hz, ${this.TARGET_CHANNELS}ch)。请检查麦克风 (${error.constraint})。`;
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          this.statusMessage = "未找到麦克风设备。";
        } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          this.statusMessage = "麦克风权限被拒绝。";
        }
        this.closeAudioResources();
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
          // 【重要】确保 /js/kws-audioworklet.js 路径相对于你的 public 文件夹是正确的
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
            processorOptions: plainProcessorOptions //  <-- 使用这个新的 plainProcessorOptions 对象
          });
          console.log('[Vue App] AudioWorkletNode "kws-audio-processor" created with options:', this.processorOptions);

          this.audioProcessorNode.port.onmessage = (event) => {
            const audioChunkArrayBuffer = event.data; // ArrayBuffer (Int16 PCM)
            if (!this.isAwoken && this.kwsSocket && this.kwsSocket.readyState === WebSocket.OPEN) {
              // KWS 阶段：发送给 KWS 服务器
              this.kwsSocket.send(audioChunkArrayBuffer);
            } else if (this.isAwoken && this.isRecording) {
              // 用户指令录制阶段：收集音频块给 LLM
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
            // KWS 检测成功并且声纹验证通过
            if (messageData.kws_keyword === KWS_WAKE_WORD && messageData.speaker_verified === true) {
              this.handleWakeWordVerified(messageData.kws_keyword, messageData.sv_score, messageData.kws_confidence);
            } else {
              console.warn('[Vue App] Received wakeup_success but keyword mismatch or speaker_verified is not true:', messageData);
              // 可选：如果关键词不匹配或 speaker_verified 不是 true，但事件仍是 wakeup_success，可以添加特定处理或日志
            }
          } else if (messageData.event === "kws_detected_sv_failed") {
            // KWS 检测成功，但声纹验证失败
            const kwsKeyword = messageData.kws_keyword || "关键词";
            const svScore = messageData.sv_score !== undefined ? messageData.sv_score.toFixed(3) : 'N/A';
            const kwsConfidence = messageData.kws_confidence !== undefined ? messageData.kws_confidence.toFixed(3) : 'N/A';

            const warningMsg = `检测到"${kwsKeyword}" (置信度: ${kwsConfidence}), 但声纹验证失败 (得分: ${svScore})。请确保是注册用户在清晰说话。`;
            this.addMessageToChat(warningMsg, 'system-warning');
            console.warn(`[Vue App] KWS detected (${kwsKeyword}), but Speaker Verification FAILED. Score: ${svScore}`);

            // 重要：此时不应设置 isAwoken = true，也不应暂停KWS，允许系统继续监听
          } else if (messageData.error) {
            console.error('[Vue App] KWS_SV Server Error:', messageData.error);
            this.statusMessage = `KWS服务错误: ${messageData.error}`;
            this.addMessageToChat(`服务器错误: ${messageData.error}`, 'system-error');
          } else {
            console.log('[Vue App] Received unhandled message type or structure from KWS_SV server:', messageData);
          }
        } catch (e) {
          console.warn('[Vue App] 收到非JSON或无法解析的KWS_SV消息:', event.data, e);
          this.addMessageToChat('收到无法解析的服务器消息。', 'system-error');
        }
      };

      this.kwsSocket.onerror = (error) => {
        this.statusMessage = 'KWS服务连接发生错误。';
        console.error('[Vue App] WebSocket error with KWS service:', error);
      };

      this.kwsSocket.onclose = (event) => {
        this.statusMessage = 'KWS服务连接已断开。';
        console.log('[Vue App] WebSocket connection to KWS service closed. Reason:', event.reason, `Code: ${event.code}`, `Was clean: ${event.wasClean}`);
        this.isAwoken = false; // KWS断开后重置唤醒状态
        // 可以在这里尝试重连，或者提示用户
        this.closeAudioProcessor();
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
      this.addMessageToChat(`"${keyword}" 身份已确认并唤醒！${kwsConfMsg}${svScoreMsg}`, 'system');
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
        // 如果WebSocket已断开，可能需要重新初始化整个KWS流程
        // if (!this.kwsSocket || this.kwsSocket.readyState === WebSocket.CLOSED) {
        //   this.initializeMicrophoneAndKWS();
        // }
      }
    },

    // --- STT/Emotion/LLM ---
    handleRecordingStart() {
      if (this.isRecording || this.isProcessing) return;
      this.isRecording = true;
      this.statusMessage = '心语正在聆听您的指令...';
      console.log('[Vue App] 用户指令录音开始，准备收集音频送往LLM API');
      this.addMessageToChat('（开始聆听指令...）', 'system');
    },

    async handleRecordingStop() {
      if (!this.isRecording && !this.isAwoken) { // 避免在非录音或未唤醒时意外触发
        console.log('[Vue App] Not recording or not awoken, stop command ignored.');
        return;
      }
      if (!this.isRecording) { // 可能已经被超时或其他逻辑停止
        console.log('[Vue App] Recording already stopped.');
        return;
      }

      this.isRecording = false;
      this.isProcessing = true; // 开始处理流程
      this.statusMessage = '指令识别中，请稍候...';
      console.log('[Vue App] 用户指令录音结束，准备发送音频。');
      this.addMessageToChat('（指令录音结束，正在处理...）', 'system');

      if (this.llmAudioChunks.length === 0) {
        console.warn('[Vue App] No audio data collected for LLM.');
        this.addMessageToChat('未能捕捉到您的指令音频，请重试。', 'system-warning');
        this.isProcessing = false;
        this.resumeKwsListening();
        return;
      }

      const audioBlob = new Blob(this.llmAudioChunks, { type: 'audio/pcm' });
      this.llmAudioChunks = []; // 清空，为下次录音做准备

      try {
        this.statusMessage = '正在发送音频并获取解析结果...';

        const headers = new Headers();
        // 使用 AudioWorklet 输出的采样率和声道数
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
          } catch (e) { /* 如果响应体不是JSON，使用状态文本 */ errorDetail = response.statusText; }
          this.addMessageToChat(`请求处理失败: ${errorDetail}`, 'system-error');
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
          this.addMessageToChat(`您说："${asr_text}"`, 'user');
        } else {
          this.addMessageToChat('（抱歉，未能清晰识别您的语音内容）', 'user');
        }
        if (emotion) {
          // 你可以创建一个辅助函数来将情绪标签转换为更友好的文本或表情
          this.addMessageToChat(`（心语感知到您的情绪可能为：${this.formatEmotion(emotion)}）`, 'system');
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
          this.addMessageToChat('（心语没有音频回应）', 'system');
          this.statusMessage = '心语回应完毕。';
          this.isProcessing = false;
          this.resumeKwsListening();
        }

      } catch (error) {
        console.error('[Vue App] 处理用户音频或与LLM API通信时出错:', error);
        this.addMessageToChat(`处理您的请求时遇到问题: ${error.message}`, 'system-error');
        this.statusMessage = '发生错误，请重试。';
        this.isProcessing = false; // 在这里重置
        this.resumeKwsListening(); // 在这里恢复
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

        // 添加loadstart事件监听
        audio.onloadstart = () => {
          console.log('[Vue App] Audio loading started.');
        };

        // 添加loadedmetadata事件监听
        audio.onloadedmetadata = () => {
          console.log('[Vue App] Audio metadata loaded.');
        };
        audio.onprogress = () => {
          console.log('[Vue App] Audio progress event. Buffered:', audio.buffered.length > 0 ? audio.buffered.end(0) : 0, 'Duration:', audio.duration);
        };
        audio.onsuspend = () => { // 当浏览器暂停获取媒体数据时（但下载并未完成）
          console.log('[Vue App] Audio suspend event.');
        };
        audio.onstalled = () => { // 当浏览器尝试获取媒体数据，但数据意外未到达时
          console.log('[Vue App] Audio stalled event.');
        };
        audio.onwaiting = () => { // 当播放因暂时缺少数据而停止时（例如缓冲）
          console.log('[Vue App] Audio waiting event.');
        };
        audio.onloadeddata = () => { // 当当前帧数据加载完成时（在 onloadedmetadata 之后）
          console.log('[Vue App] Audio loadeddata event. ReadyState:', audio.readyState);
        };

        // 可选：处理加载和播放事件
        audio.oncanplaythrough = () => {
          console.log('[Vue App] Audio can play through.');
          audio.play()
            .then(() => {
              console.log('[Vue App] TTS Audio playback started.');
              this.statusMessage = '心语回应播放中...';
            })
            .catch(e => {
              console.error('[Vue App] Error playing TTS audio:', e);
              this.addMessageToChat('播放回应音频失败。', 'system-error');
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
          this.addMessageToChat(errorMsg, 'system-error');
          this.statusMessage = '回应音频加载失败。';
          resumeKWSAndResetProcessing();
        };

        // 设置预加载策略
        audio.preload = 'auto';

        // 开始加载音频
        audio.load();

      } catch (e) {
        console.error('[Vue App] Exception during audio playback setup:', e);
        this.addMessageToChat(`音频播放错误: ${e.message}`, 'system-error');
        this.statusMessage = '回应播放功能异常。';
        resumeKWSAndResetProcessing();
      }
    },

    closeAudioProcessor() {
      if (this.audioProcessorNode) {
        try {
          this.audioProcessorNode.port.postMessage('stop'); // 尝试通知worklet停止
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
        this.audioContext = null; // 确保设置为null
      }
      if (this.kwsSocket && (this.kwsSocket.readyState === WebSocket.OPEN || this.kwsSocket.readyState === WebSocket.CONNECTING)) {
        this.kwsSocket.close(1000, "Client shutting down"); // Code 1000 for normal closure
      }
      this.kwsSocket = null; // 确保设置为null
    },

    // Splash Screen handler
    handleSplashFinished() {
      this.showSplash = false;
      this.initializeMicrophoneAndKWS(); // 移动到这里以确保在SplashScreen后调用
    },

    // Settings panel management
    toggleSettings() {
      this.showSettings = !this.showSettings;
      if (this.showSettings) {
        this.showNotification('设置面板已打开', 'info');
      }
    },

    handleSettingsChanged(newSettings) {
      this.appSettings = { ...this.appSettings, ...newSettings };
      
      // Apply theme changes
      if (newSettings.theme) {
        this.applyTheme(newSettings.theme);
      }
      
      // Apply volume changes
      if (newSettings.volume !== undefined) {
        this.updateSystemVolume(newSettings.volume);
      }
      
      // Save settings to localStorage
      localStorage.setItem('xinyu-settings', JSON.stringify(this.appSettings));
      
      this.showNotification('设置已保存', 'success');
    },

    applyTheme(theme) {
      const root = document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
      } else if (theme === 'light') {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
      } else {
        // Auto theme - follow system preference
        root.classList.remove('dark-theme', 'light-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark-theme');
        } else {
          root.classList.add('light-theme');
        }
      }
    },

    updateSystemVolume(volume) {
      // This would control TTS volume when implemented
      console.log('Volume updated to:', volume);
    },

    loadSavedSettings() {
      try {
        const saved = localStorage.getItem('xinyu-settings');
        if (saved) {
          this.appSettings = { ...this.appSettings, ...JSON.parse(saved) };
          this.applyTheme(this.appSettings.theme);
        }
      } catch (error) {
        console.warn('Failed to load saved settings:', error);
      }
    },

  },

  mounted() {
    // Load saved settings
    this.loadSavedSettings();
    
    // 自动开始初始化KWS
    // this.initializeMicrophoneAndKWS();
    
    // Add keyboard event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    
    // Show welcome notification
    setTimeout(() => {
      this.showNotification('心语已启动，请说出"小云小云"来唤醒我', 'info');
    }, 1000);

    // 可以在这里添加一些欢迎消息到聊天界面
    // this.addMessageToChat("你好，我是心语，请说"小云小云"唤醒我。", "xinyu");
  },

  beforeUnmount() { // Vue 3 (Vue 2 是 beforeDestroy)
    this.closeAudioResources();
    
    // Remove keyboard event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }
};
</script>

<style>
/* Global Styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  line-height: 1.6;
  min-height: 100vh;
}

#xinyu-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
}

/* Background Decorations */
.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  animation: float 6s ease-in-out infinite;
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

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

/* Header Styles */
.app-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 25px 30px;
  position: relative;
  z-index: 10;
  border-radius: 20px 20px 0 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  font-size: 2.5em;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.app-header h1 {
  margin: 0;
  font-size: 2.2em;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.status-section {
  display: flex;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  font-size: 0.9em;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  animation: status-pulse 2s ease-in-out infinite;
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes recording-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

@keyframes processing-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

/* Main Content */
.app-main {
  flex: 1;
  position: relative;
  z-index: 5;
  overflow: hidden;
}

/* Footer Styles */
.app-footer {
  padding: 25px 30px;
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
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

/* Processing Indicator */
.processing-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin: 20px;
}

.processing-animation {
  position: relative;
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

.processing-text {
  font-size: 16px;
  font-weight: 500;
  color: #4a5568;
  text-align: center;
}

/* Enhanced Recording Status */
.recording-status {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  padding: 12px 20px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  color: #6b7280;
  transition: all 0.3s ease;
}

.recording-status.active {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(238, 90, 82, 0.9) 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.recording-pulse {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Keyboard Shortcuts Help */
.keyboard-help {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 12px;
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 1000;
}

.keyboard-help.show {
  opacity: 1;
  transform: translateY(0);
}

.keyboard-help-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.keyboard-help-item:last-child {
  margin-bottom: 0;
}

.keyboard-key {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
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

/* Notification System Styles */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  min-width: 300px;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 0;
  transform: translateX(120%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.notification.show {
  transform: translateX(0);
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 12px;
}

.notification-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.notification-text {
  color: #2d3748;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin: 0;
}

/* Notification Types */
.notification-info {
  border-left: 4px solid #3182ce;
}

.notification-success {
  border-left: 4px solid #38a169;
}

.notification-warning {
  border-left: 4px solid #d69e2e;
}

.notification-error {
  border-left: 4px solid #e53e3e;
}

/* Settings Panel Animation */
.settings-panel-enter-active,
.settings-panel-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-panel-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.settings-panel-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Enhanced hover effects for buttons */
.settings-button {
  position: relative;
  overflow: hidden;
}

.settings-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.settings-button:hover::before {
  width: 100px;
  height: 100px;
}

/* Improved focus styles for accessibility */
.settings-button:focus-visible {
  outline: 2px solid #3182ce;
  outline-offset: 2px;
}

/* Dark theme styles */
.dark-theme .notification {
  background: rgba(26, 32, 44, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .notification-text {
  color: #e2e8f0;
}

.dark-theme .app-header {
  background: rgba(26, 32, 44, 0.8);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .main-app-content {
  background: rgba(26, 32, 44, 0.9);
}

.dark-theme .status-text {
  color: #cbd5e0;
}

/* Light theme styles */
.light-theme .notification {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(0, 0, 0, 0.1);
}

.light-theme .app-header {
  background: rgba(255, 255, 255, 0.9);
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

.light-theme .main-app-content {
  background: rgba(255, 255, 255, 0.95);
}

/* Smooth scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Performance optimizations */
.decoration-circle,
.processing-dots .dot,
.status-dot {
  will-change: transform;
  transform: translateZ(0);
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .decoration-circle {
    animation: none !important;
  }
}
</style>
