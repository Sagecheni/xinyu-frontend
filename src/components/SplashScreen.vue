<template>
  <div class="splash-screen" :class="{ 'fade-out': isHiding }">
    <!-- Background animations -->
    <div class="background-animation">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
      <div class="floating-circle circle-4"></div>
      <div class="floating-circle circle-5"></div>
    </div>
    
    <!-- Main content -->
    <div class="splash-content">
      <!-- Logo animation -->
      <div class="logo-container">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
              </defs>
              
              <!-- Heart shape representing emotion -->
              <path d="M50,85 C50,85 20,65 20,45 C20,35 30,25 40,25 C45,25 50,30 50,30 C50,30 55,25 60,25 C70,25 80,35 80,45 C80,65 50,85 50,85 Z" 
                    fill="url(#logoGradient)" 
                    class="heart-path"/>
              
              <!-- Sound waves -->
              <circle cx="50" cy="50" r="35" fill="none" stroke="url(#logoGradient)" stroke-width="2" opacity="0.6" class="wave-circle wave-1"/>
              <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" stroke-width="1" opacity="0.4" class="wave-circle wave-2"/>
              <circle cx="50" cy="50" r="55" fill="none" stroke="url(#logoGradient)" stroke-width="1" opacity="0.2" class="wave-circle wave-3"/>
            </svg>
          </div>
          
          <!-- App name -->
          <h1 class="app-name">心语</h1>
          <p class="app-subtitle">AI 语音助手</p>
        </div>
      </div>
      
      <!-- Loading animation -->
      <div class="loading-section">
        <div class="loading-text">{{ loadingText }}</div>
        <div class="loading-dots">
          <div class="dot dot-1"></div>
          <div class="dot dot-2"></div>
          <div class="dot dot-3"></div>
        </div>
        
        <!-- Progress bar -->
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
      
      <!-- Feature highlights -->
      <div class="features">
        <div class="feature-item" v-for="(feature, index) in features" :key="index" 
             :class="{ 'active': currentFeature === index }">
          <div class="feature-icon">{{ feature.icon }}</div>
          <div class="feature-text">{{ feature.text }}</div>
        </div>
      </div>
    </div>
    
    <!-- Particles animation -->
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" 
           :style="{ 
             left: Math.random() * 100 + '%', 
             animationDelay: Math.random() * 3 + 's',
             animationDuration: (Math.random() * 3 + 2) + 's'
           }">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SplashScreen',
  data() {
    return {
      isHiding: false,
      progress: 0,
      currentFeature: 0,
      loadingText: '正在初始化...',
      features: [
        { icon: '🎤', text: '智能语音识别' },
        { icon: '🧠', text: 'AI 情感分析' },
        { icon: '💬', text: '自然语言对话' },
        { icon: '🔊', text: '语音合成输出' },
      ],
      loadingSteps: [
        '正在初始化...',
        '加载语音模块...',
        '连接AI服务...',
        '准备就绪！'
      ]
    };
  },
  methods: {
    startLoading() {
      let step = 0;
      const interval = setInterval(() => {
        this.progress = Math.min(100, this.progress + Math.random() * 25 + 10);
        
        if (step < this.loadingSteps.length) {
          this.loadingText = this.loadingSteps[step];
          step++;
        }
        
        if (this.progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            this.hideSplash();
          }, 500);
        }
      }, 800);
    },
    
    hideSplash() {
      this.isHiding = true;
      setTimeout(() => {
        this.$emit('splash-finished');
      }, 600);
    },
    
    cycleFeatures() {
      setInterval(() => {
        this.currentFeature = (this.currentFeature + 1) % this.features.length;
      }, 2000);
    }
  },
  
  mounted() {
    // Start animations
    setTimeout(() => {
      this.startLoading();
      this.cycleFeatures();
    }, 1000);
  }
};
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.splash-screen.fade-out {
  opacity: 0;
  transform: scale(1.1);
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 15%;
  animation-delay: 1s;
}

.circle-3 {
  width: 60px;
  height: 60px;
  top: 80%;
  left: 20%;
  animation-delay: 2s;
}

.circle-4 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 25%;
  animation-delay: 3s;
}

.circle-5 {
  width: 140px;
  height: 140px;
  top: 70%;
  left: 70%;
  animation-delay: 4s;
}

.splash-content {
  text-align: center;
  color: white;
  z-index: 2;
  max-width: 400px;
  padding: 40px;
}

.logo-container {
  margin-bottom: 40px;
}

.logo-wrapper {
  animation: slideInDown 1s ease-out;
}

.logo-icon {
  margin-bottom: 20px;
  animation: logoGlow 2s ease-in-out infinite alternate;
}

.heart-path {
  animation: heartbeat 2s ease-in-out infinite;
}

.wave-circle {
  animation: ripple 2s ease-in-out infinite;
}

.wave-1 {
  animation-delay: 0s;
}

.wave-2 {
  animation-delay: 0.3s;
}

.wave-3 {
  animation-delay: 0.6s;
}

.app-name {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  background: linear-gradient(45deg, #ffffff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: textShimmer 3s ease-in-out infinite;
}

.app-subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  margin: 0;
  opacity: 0.9;
  animation: fadeInUp 1s ease-out 0.5s both;
}

.loading-section {
  margin-bottom: 40px;
  animation: fadeInUp 1s ease-out 1s both;
}

.loading-text {
  font-size: 1rem;
  margin-bottom: 20px;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 30px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: dotBounce 1.4s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.2s;
}

.dot-3 {
  animation-delay: 0.4s;
}

.progress-container {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ffffff, #f0f8ff);
  border-radius: 2px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  animation: fadeInUp 1s ease-out 1.5s both;
}

.feature-item {
  padding: 15px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  opacity: 0.7;
}

.feature-item.active {
  opacity: 1;
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.2);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.feature-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particleRise linear infinite;
}

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoGlow {
  from {
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  }
  to {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));
  }
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes ripple {
  0% {
    opacity: 1;
    transform: scale(0.8);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

@keyframes textShimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes dotBounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-15px);
  }
}

@keyframes particleRise {
  from {
    bottom: -10px;
    opacity: 1;
  }
  to {
    bottom: 100vh;
    opacity: 0;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .splash-content {
    padding: 20px;
    max-width: 350px;
  }
  
  .app-name {
    font-size: 2.5rem;
  }
  
  .app-subtitle {
    font-size: 1rem;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .feature-item {
    padding: 12px;
  }
  
  .floating-circle {
    display: none;
  }
}

@media (max-width: 480px) {
  .splash-content {
    padding: 15px;
  }
  
  .app-name {
    font-size: 2rem;
  }
  
  .logo-icon svg {
    width: 60px;
    height: 60px;
  }
  
  .feature-icon {
    font-size: 1.5rem;
  }
  
  .feature-text {
    font-size: 0.8rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .splash-screen,
  .logo-icon,
  .floating-circle,
  .particle,
  .dot,
  .wave-circle,
  .heart-path {
    animation: none;
  }
  
  .feature-item.active {
    transform: none;
  }
}
</style>