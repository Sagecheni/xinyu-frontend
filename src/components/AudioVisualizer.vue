<!-- AudioVisualizer.vue -->
<template>
  <div class="audio-visualizer" :class="{ active: isActive }">
    <canvas ref="canvas" class="visualizer-canvas"></canvas>
    <div class="visualizer-overlay">
      <div class="wave-container">
        <div class="wave" v-for="i in 5" :key="i" :style="{ animationDelay: i * 0.1 + 's' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AudioVisualizer',
  props: {
    isActive: {
      type: Boolean,
      default: false
    },
    audioData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      canvas: null,
      canvasContext: null,
      animationId: null
    }
  },
  mounted() {
    this.initCanvas()
    if (this.isActive) {
      this.startVisualization()
    }
  },
  beforeUnmount() {
    this.stopVisualization()
  },
  watch: {
    isActive(newVal) {
      if (newVal) {
        this.startVisualization()
      } else {
        this.stopVisualization()
      }
    }
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.canvas
      this.canvasContext = this.canvas.getContext('2d')
      this.resizeCanvas()
      window.addEventListener('resize', this.resizeCanvas)
    },

    resizeCanvas() {
      const rect = this.canvas.parentElement.getBoundingClientRect()
      this.canvas.width = rect.width * window.devicePixelRatio
      this.canvas.height = rect.height * window.devicePixelRatio
      this.canvas.style.width = rect.width + 'px'
      this.canvas.style.height = rect.height + 'px'
      this.canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio)
    },

    startVisualization() {
      this.draw()
    },

    stopVisualization() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    },

    draw() {
      const canvas = this.canvas
      const ctx = this.canvasContext
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw audio bars
      if (this.audioData && this.audioData.length > 0) {
        this.drawAudioBars(ctx, width, height)
      } else {
        this.drawDefaultWave(ctx, width, height)
      }

      this.animationId = requestAnimationFrame(this.draw)
    },

    drawAudioBars(ctx, width, height) {
      const barWidth = width / this.audioData.length
      const barMaxHeight = height * 0.8

      this.audioData.forEach((value, index) => {
        const barHeight = (value / 255) * barMaxHeight
        const x = index * barWidth
        const y = height - barHeight

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(0.5, '#764ba2')
        gradient.addColorStop(1, '#f093fb')

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth - 1, barHeight)
      })
    },

    drawDefaultWave(ctx, width, height) {
      const time = Date.now() * 0.002
      const amplitude = height * 0.3
      const frequency = 0.02

      ctx.beginPath()
      ctx.moveTo(0, height / 2)

      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * frequency + time) * amplitude
        ctx.lineTo(x, y)
      }

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, 'rgba(102, 126, 234, 0.6)')
      gradient.addColorStop(0.5, 'rgba(118, 75, 162, 0.6)')
      gradient.addColorStop(1, 'rgba(240, 147, 251, 0.6)')

      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.stroke()
    }
  }
}
</script>

<style scoped>
.audio-visualizer {
  position: relative;
  width: 100%;
  height: 60px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.audio-visualizer.active {
  background: rgba(102, 126, 234, 0.1);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.visualizer-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.visualizer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.wave-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 4px;
}

.wave {
  width: 3px;
  height: 20px;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 2px;
  animation: waveAnimation 1.5s ease-in-out infinite;
  opacity: 0.7;
}

.audio-visualizer.active .wave {
  animation-play-state: running;
}

.audio-visualizer:not(.active) .wave {
  animation-play-state: paused;
  height: 4px;
}

@keyframes waveAnimation {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1.5);
  }
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  .audio-visualizer {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .audio-visualizer.active {
    background: rgba(102, 126, 234, 0.2);
  }
}
</style>
