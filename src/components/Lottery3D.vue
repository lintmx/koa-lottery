<template>
  <div ref="containerRef" class="lottery-3d-container" @click="handleContainerClick">
    <canvas ref="canvasRef" class="lottery-canvas"></canvas>
    <div class="lottery-overlay" v-if="showOverlay">
      <div class="lottery-info">
        <h2 class="prize-name">{{ currentPrize?.name }}</h2>
        <div class="participants-display">
          <div class="current-spinning" v-if="!winner && highlightedParticipant">
            <div class="spinning-name">{{ highlightedParticipant.name }}</div>
          </div>
        </div>
        <div v-if="winner" class="winner-announcement">
          <div class="winner-crown">👑</div>
          <h3 class="winner-name">{{ winner.name }}</h3>
          <p class="winner-prize">获得 {{ currentPrize?.name }}</p>
          <div class="celebration-emoji">🎉✨🎊</div>
          <div v-if="props.showResult" class="click-to-continue">
            <p class="click-hint">点击页面任意处继续</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import type { Participant, Prize } from '@/types/lottery'

interface Props {
  participants: Participant[]
  currentPrize: Prize | null
  isDrawing: boolean
  showResult: boolean
  animationDuration?: number
}

interface Emits {
  (e: 'drawComplete', participant: Participant): void
  (e: 'clickToHide'): void
}

const props = withDefaults(defineProps<Props>(), {
  animationDuration: 3000,
  showResult: false
})

const emit = defineEmits<Emits>()

const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const showOverlay = ref(false)
const displayParticipants = ref<Participant[]>([])
const highlightedParticipant = ref<Participant | null>(null)
const winner = ref<Participant | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number
let spheres: THREE.Mesh[] = []
let isAnimating = false
let resizeObserver: ResizeObserver | null = null

// 初始化3D场景
const initThreeJS = () => {
  if (!containerRef.value || !canvasRef.value) return

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000011)

  // 创建相机
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.z = 30

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  scene.add(directionalLight)

  // 创建粒子背景
  createParticleBackground()

  // 开始渲染循环
  animate()
}

// 创建粒子背景
const createParticleBackground = () => {
  const geometry = new THREE.BufferGeometry()
  const particleCount = 1000
  const positions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true,
    opacity: 0.6
  })

  const particles = new THREE.Points(geometry, material)
  scene.add(particles)
}

// 创建抽奖球体
const createLotterySpheres = () => {
  // 清除现有球体
  spheres.forEach(sphere => {
    scene.remove(sphere)
    if (sphere.userData.textSprite) {
      scene.remove(sphere.userData.textSprite)
    }
  })
  spheres = []

  if (props.participants.length === 0) return

  const sphereGeometry = new THREE.SphereGeometry(1.2, 32, 32)

  props.participants.forEach((participant, index) => {
    // 创建球体材质
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL((index * 0.618033988749895) % 1, 0.8, 0.6),
      shininess: 100,
      transparent: true,
      opacity: 0.9
    })

    const sphere = new THREE.Mesh(sphereGeometry, material)

    // 使用斐波那契螺旋分布球体位置
    const radius = 18
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const y = 1 - (index / (props.participants.length - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = goldenAngle * index

    sphere.position.x = Math.cos(theta) * radiusAtY * radius
    sphere.position.y = y * radius * 0.8
    sphere.position.z = Math.sin(theta) * radiusAtY * radius

    // 创建文字纹理
    const textTexture = createTextTexture(participant.name)
    const textMaterial = new THREE.SpriteMaterial({
      map: textTexture,
      transparent: true,
      depthTest: false,
      sizeAttenuation: false
    })
    const textSprite = new THREE.Sprite(textMaterial)
    textSprite.scale.set(0.15, 0.08, 1)
    textSprite.position.copy(sphere.position)

    sphere.userData = { participant, textSprite }
    scene.add(sphere)
    scene.add(textSprite)
    spheres.push(sphere)
  })
}

// 创建文字纹理
const createTextTexture = (text: string) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!

  canvas.width = 512
  canvas.height = 256

  // 设置字体样式
  context.font = 'bold 48px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  // 绘制背景
  context.fillStyle = 'rgba(255, 255, 255, 0.95)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制边框
  context.strokeStyle = '#409eff'
  context.lineWidth = 8
  context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)

  // 绘制文字
  context.fillStyle = '#333333'
  context.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// 开始抽奖动画
const startLotteryAnimation = async () => {
  if (isAnimating || props.participants.length === 0) return

  isAnimating = true
  showOverlay.value = true
  displayParticipants.value = [...props.participants]
  highlightedParticipant.value = null
  winner.value = null

  // 创建球体
  createLotterySpheres()

  // 动画阶段1: 球体旋转和聚合
  await animateSpheres()

  // 动画阶段2: 快速切换高亮
  await animateSelection()

  // 确定最终中奖者
  const winnerIndex = Math.floor(Math.random() * props.participants.length)
  const selectedParticipant = props.participants[winnerIndex]

  winner.value = selectedParticipant
  highlightedParticipant.value = selectedParticipant

  // 庆祝动画
  await celebrateWinner()

  // 通知父组件抽奖完成
  emit('drawComplete', selectedParticipant)

  // 结束动画状态，但保持显示覆盖层
  isAnimating = false
}

// 球体动画
const animateSpheres = (): Promise<void> => {
  return new Promise(resolve => {
    const duration = props.animationDuration * 0.5
    const startTime = Date.now()

    const animateFrame = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 让球体旋转并逐渐聚合到中心
      spheres.forEach((sphere, index) => {
        const participant = sphere.userData.participant
        const textSprite = sphere.userData.textSprite

        // 旋转
        const rotationSpeed = 0.02 + index * 0.001
        sphere.rotation.x += rotationSpeed
        sphere.rotation.y += rotationSpeed

        // 向中心聚合
        const targetRadius = 10 + progress * 5
        const currentPos = sphere.position.clone()
        const centerDirection = currentPos.clone().normalize()
        const targetPos = centerDirection.multiplyScalar(targetRadius)

        sphere.position.lerp(targetPos, 0.02)
        textSprite.position.copy(sphere.position)

        // 高亮效果
        const material = sphere.material as THREE.MeshPhongMaterial
        material.opacity = 0.7 + Math.sin(elapsed * 0.01 + index) * 0.3
      })

      if (progress < 1) {
        requestAnimationFrame(animateFrame)
      } else {
        resolve()
      }
    }

    animateFrame()
  })
}

// 选择动画
const animateSelection = (): Promise<void> => {
  return new Promise(resolve => {
    const duration = props.animationDuration * 0.4
    const startTime = Date.now()
    let lastHighlightTime = 0
    const baseInterval = 50

    const animateFrame = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 动态调整高亮间隔，越来越慢
      const currentInterval = baseInterval * (1 + progress * 5)

      if (elapsed - lastHighlightTime > currentInterval) {
        const randomIndex = Math.floor(Math.random() * props.participants.length)
        highlightedParticipant.value = props.participants[randomIndex]

        // 高亮对应的球体
        spheres.forEach((sphere, index) => {
          const material = sphere.material as THREE.MeshPhongMaterial
          if (index === randomIndex) {
            material.color.setHex(0xffd700) // 金色高亮
            material.emissive.setHex(0x332200)
          } else {
            material.color.setHSL((index * 0.618033988749895) % 1, 0.8, 0.6)
            material.emissive.setHex(0x000000)
          }
        })

        lastHighlightTime = elapsed
      }

      if (progress < 1) {
        requestAnimationFrame(animateFrame)
      } else {
        resolve()
      }
    }

    animateFrame()
  })
}

// 庆祝动画
const celebrateWinner = (): Promise<void> => {
  return new Promise(resolve => {
    const duration = props.animationDuration * 0.3
    const startTime = Date.now()

    // 找到中奖者对应的球体
    const winnerSphere = spheres.find(s => s.userData.participant.id === winner.value?.id)

    if (winnerSphere) {
      const originalScale = winnerSphere.scale.clone()
      const targetScale = originalScale.clone().multiplyScalar(2)

      const animateFrame = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // 中奖球体放大和发光
        const scale = originalScale.clone().lerp(targetScale,
          Math.sin(progress * Math.PI * 4) * 0.3 + 1
        )
        winnerSphere.scale.copy(scale)
        if (winnerSphere.userData.textSprite) {
          winnerSphere.userData.textSprite.scale.set(
            0.15 * scale.x,
            0.08 * scale.y,
            1
          )
        }

        // 发光效果
        const material = winnerSphere.material as THREE.MeshPhongMaterial
        material.color.setHex(0xffd700)
        material.emissive.setHex(0x444400)

        // 其他球体淡出
        spheres.forEach(sphere => {
          if (sphere !== winnerSphere) {
            const material = sphere.material as THREE.MeshPhongMaterial
            material.opacity = Math.max(0.1, 1 - progress)
            if (sphere.userData.textSprite) {
              sphere.userData.textSprite.material.opacity = material.opacity
            }
          }
        })

        if (progress < 1) {
          requestAnimationFrame(animateFrame)
        } else {
          resolve()
        }
      }

      animateFrame()
    } else {
      setTimeout(() => {
        resolve()
      }, duration)
    }
  })
}

// 渲染循环
const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 相机轻微摆动
  camera.position.x = Math.sin(Date.now() * 0.0005) * 2
  camera.position.y = Math.cos(Date.now() * 0.0003) * 1

  renderer.render(scene, camera)
}

// 处理窗口大小变化
const handleResize = () => {
  if (!containerRef.value || !renderer || !camera) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

// 处理容器点击事件
const handleContainerClick = () => {
  if (props.showResult && winner.value) {
    emit('clickToHide')
  }
}

// 监听抽奖状态变化
watch(() => props.isDrawing, (newValue) => {
  if (newValue && props.currentPrize) {
    startLotteryAnimation()
  }
})

// 监听显示结果状态变化
watch(() => props.showResult, (newValue) => {
  if (!newValue) {
    showOverlay.value = false
    winner.value = null
    highlightedParticipant.value = null
  } else if (winner.value) {
    showOverlay.value = true
  }
})

onMounted(() => {
  initThreeJS()
  window.addEventListener('resize', handleResize)

  // 使用 ResizeObserver 监听容器大小变化
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.lottery-3d-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.lottery-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.lottery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  backdrop-filter: blur(2px);
}

.lottery-info {
  text-align: center;
  color: white;
  max-width: 90%;
}

.prize-name {
  font-size: 2.8rem;
  font-weight: bold;
  margin-bottom: 3rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.7);
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  background-size: 200% 200%;
  animation: gradient-flow 2s ease-in-out infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.current-spinning {
  margin-bottom: 2rem;
}

.spinning-name {
  font-size: 2rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  padding: 1rem 2rem;
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid #ffd700;
  border-radius: 15px;
  animation: pulse-glow 1s ease-in-out infinite;
  backdrop-filter: blur(10px);
}

.winner-announcement {
  animation: winner-appear 0.8s ease-out;
  text-align: center;
}

.winner-crown {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: crown-bounce 2s ease-in-out infinite;
}

.winner-name {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
  background-size: 200% 200%;
  animation: gradient-flow 2s ease-in-out infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  letter-spacing: 1px;
}

.winner-prize {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.celebration-emoji {
  font-size: 2.5rem;
  animation: celebration-float 1.5s ease-in-out infinite;
  letter-spacing: 1rem;
}

.click-to-continue {
  margin-top: 2rem;
  animation: fade-pulse 2s ease-in-out infinite;
}

.click-hint {
  font-size: 1.2rem;
  color: #ffd700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  font-weight: 500;
}

@keyframes gradient-flow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
  }
}

@keyframes winner-appear {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(50px);
  }
  50% {
    transform: scale(1.1) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes crown-bounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.1);
  }
}

@keyframes celebration-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(5deg);
  }
  66% {
    transform: translateY(-5px) rotate(-5deg);
  }
}

@keyframes fade-pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prize-name {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .spinning-name {
    font-size: 1.5rem;
    padding: 0.8rem 1.5rem;
  }

  .winner-name {
    font-size: 2.5rem;
  }

  .winner-prize {
    font-size: 1.2rem;
  }

  .celebration-emoji {
    font-size: 2rem;
    letter-spacing: 0.5rem;
  }
}
</style>
