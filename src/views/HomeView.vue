<template>
  <div class="lottery-home">
    <!-- 顶部导航栏 -->
    <nav class="top-nav">
      <div class="nav-left">
        <h1 class="site-title">{{ lotteryStore.settings.siteName }}</h1>
      </div>
      <div class="nav-right">
        <el-button @click="showParticipantImport = true" type="info" size="small">
          <el-icon><User /></el-icon>
          导入参与者
        </el-button>
        <el-button @click="showPrizeImport = true" type="warning" size="small">
          <el-icon><Present /></el-icon>
          导入奖品
        </el-button>
        <el-button @click="showSettings = true" type="primary" size="small" :icon="Setting">
          设置
        </el-button>
        <el-button @click="showResults = true" type="success" size="small" :icon="Trophy">
          结果
        </el-button>
      </div>
    </nav>

    <!-- 主体内容 -->
    <div class="main-layout">
      <!-- 左侧信息面板 -->
      <aside class="info-panel">
        <!-- 当前奖品信息 -->
        <div class="current-prize-card" v-if="selectedPrize">
          <div class="prize-header">
            <h3>🎯 当前奖品</h3>
          </div>
          <div class="prize-content">
            <h4>{{ selectedPrize.name }}</h4>
            <div class="prize-stats">
              <span class="remaining">剩余 {{ selectedPrize.count - selectedPrize.wonCount }}</span>
              <span class="total">/ {{ selectedPrize.count }}</span>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-overview">
          <div class="stats-header">
            <h3>📊 统计概览</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalParticipants }}</div>
              <div class="stat-label">总参与人数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ statistics.remainingParticipants }}</div>
              <div class="stat-label">剩余人数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalPrizes }}</div>
              <div class="stat-label">总奖品数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalResults }}</div>
              <div class="stat-label">已中奖</div>
            </div>
          </div>
        </div>

        <!-- 奖品列表 -->
        <div class="prize-section">
          <div class="section-header">
            <h3>🎁 奖品列表</h3>
          </div>
          <div class="prize-grid">
            <div
              v-for="prize in lotteryStore.availablePrizes"
              :key="prize.id"
              class="prize-card"
              :class="{ 'selected': selectedPrize?.id === prize.id }"
              @click="selectPrize(prize)"
            >
              <div class="prize-name">{{ prize.name }}</div>
              <div class="prize-count">{{ prize.count - prize.wonCount }}/{{ prize.count }}</div>
            </div>
          </div>
        </div>

        <!-- 最近中奖 -->
        <div class="recent-winners" v-if="lotteryStore.results.length > 0">
          <div class="section-header">
            <h3>🏆 最近中奖</h3>
          </div>
          <div class="winners-list">
            <div
              v-for="result in recentResults"
              :key="result.id"
              class="winner-card"
            >
              <div class="winner-info">
                <strong>{{ result.participantName }}</strong>
                <small>{{ result.prizeName }}</small>
              </div>
              <el-button
                @click="removeWinner(result.id)"
                size="small"
                type="danger"
                text
                circle
                :icon="Delete"
              />
            </div>
          </div>
        </div>
      </aside>

      <!-- 主抽奖区域 -->
      <main class="lottery-stage">
        <div class="stage-container">
          <Lottery3D
            v-if="lotteryStore.participants.length > 0"
            :participants="lotteryStore.availableParticipants"
            :current-prize="lotteryStore.currentPrize"
            :is-drawing="lotteryStore.isDrawing"
            :show-result="lotteryStore.showResult"
            :animation-duration="lotteryStore.settings.animationDuration"
            @draw-complete="handleDrawComplete"
            @click-to-hide="handleClickToHide"
          />
          <div v-else class="empty-stage">
            <div class="empty-content">
              <el-icon size="80"><UserFilled /></el-icon>
              <h3>暂无参与者</h3>
              <p>请先导入参与者数据开始抽奖</p>
              <el-button @click="showParticipantImport = true" type="primary" size="large">
                导入参与者
              </el-button>
            </div>
          </div>
        </div>

        <!-- 抽奖控制台 -->
        <div class="control-panel">
          <div class="control-content">
            <el-button
              @click="startLottery"
              :disabled="!canStartDraw || lotteryStore.isDrawing || lotteryStore.showResult"
              :type="lotteryStore.isDrawing ? 'info' : (lotteryStore.showResult ? 'warning' : 'primary')"
              size="large"
              class="draw-button"
              :loading="lotteryStore.isDrawing"
            >
              <el-icon v-if="!lotteryStore.isDrawing && !lotteryStore.showResult"><CaretRight /></el-icon>
              {{ lotteryStore.isDrawing ? '抽奖中...' : (lotteryStore.showResult ? '查看结果中' : '开始抽奖') }}
            </el-button>
            <div class="control-info" v-if="selectedPrize">
              <span v-if="lotteryStore.showResult">点击抽奖区域继续下一轮</span>
              <span v-else>{{ lotteryStore.isDrawing ? '正在抽取：' : '即将抽取：' }}{{ selectedPrize.name }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 对话框保持不变 -->
    <ParticipantImport
      v-model="showParticipantImport"
      @import-success="handleParticipantImport"
    />

    <PrizeImport
      v-model="showPrizeImport"
      @import-success="handlePrizeImport"
    />

    <SettingsDialog
      v-model="showSettings"
    />

    <ResultsDialog
      v-model="showResults"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Trophy, Delete, User, Present, UserFilled, CaretRight } from '@element-plus/icons-vue'
import { useLotteryStore } from '@/stores/lottery'
import type { Prize, Participant } from '@/types/lottery'
import Lottery3D from '@/components/Lottery3D.vue'
import ParticipantImport from '@/components/ParticipantImport.vue'
import PrizeImport from '@/components/PrizeImport.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'
import ResultsDialog from '@/components/ResultsDialog.vue'

const lotteryStore = useLotteryStore()

const selectedPrize = ref<Prize | null>(null)
const showParticipantImport = ref(false)
const showPrizeImport = ref(false)
const showSettings = ref(false)
const showResults = ref(false)

// 计算属性
const statistics = computed(() => lotteryStore.getStatistics())

const canStartDraw = computed(() => {
  return !lotteryStore.isDrawing &&
         !lotteryStore.showResult &&
         selectedPrize.value &&
         lotteryStore.availableParticipants.length > 0 &&
         selectedPrize.value.wonCount < selectedPrize.value.count
})

const recentResults = computed(() => {
  return lotteryStore.results
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)
})

// 选择奖品
const selectPrize = (prize: Prize) => {
  if (lotteryStore.isDrawing) return
  selectedPrize.value = prize
}

// 开始抽奖
const startLottery = () => {
  if (!selectedPrize.value) {
    ElMessage.warning('请先选择要抽取的奖品')
    return
  }

  if (lotteryStore.availableParticipants.length === 0) {
    ElMessage.warning('没有可参与抽奖的人员')
    return
  }

  const success = lotteryStore.startDraw(selectedPrize.value)
  if (!success) {
    ElMessage.error('无法开始抽奖，请检查奖品状态')
  }
}

// 抽奖完成回调
const handleDrawComplete = (participant: Participant) => {
  lotteryStore.completeDraw(participant)
  ElMessage.success(`恭喜 ${participant.name} 获得 ${selectedPrize.value?.name}！`)
}

// 处理点击隐藏结果
const handleClickToHide = () => {
  lotteryStore.hideResult()

  // 自动选择下一个可用奖品
  if (selectedPrize.value && selectedPrize.value.wonCount >= selectedPrize.value.count) {
    const nextPrize = lotteryStore.availablePrizes.find(p => p.id !== selectedPrize.value?.id)
    selectedPrize.value = nextPrize || null
  }
}

// 处理参与者导入
const handleParticipantImport = (participants: Participant[]) => {
  lotteryStore.setParticipants(participants)
  ElMessage.success(`成功导入 ${participants.length} 名参与者`)
}

// 处理奖品导入
const handlePrizeImport = (prizes: Prize[]) => {
  lotteryStore.setPrizes(prizes)
  ElMessage.success(`成功导入 ${prizes.length} 个奖品`)

  // 自动选择第一个奖品
  if (prizes.length > 0 && !selectedPrize.value) {
    selectedPrize.value = prizes[0]
  }
}

// 移除中奖者并重抽
const removeWinner = async (resultId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除此中奖结果吗？该参与者将重新参与抽奖。',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const success = lotteryStore.removeResult(resultId)
    if (success) {
      ElMessage.success('已删除中奖结果，该参与者可重新参与抽奖')
    } else {
      ElMessage.error('删除失败')
    }
  } catch {
    // 用户取消操作
  }
}

onMounted(() => {
  // 加载保存的数据
  lotteryStore.loadData()

  // 如果有奖品，自动选择第一个
  if (lotteryStore.availablePrizes.length > 0) {
    selectedPrize.value = lotteryStore.availablePrizes[0]
  }
})
</script>

<style scoped>
.lottery-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #667eea 75%, #764ba2 100%);
  overflow: hidden;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-left .site-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-right {
  display: flex;
  gap: 10px;
}

/* 主布局 */
.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: calc(100vh - 70px);
  overflow: hidden;
}

/* 左侧信息面板 */
.info-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

/* 当前奖品卡片 */
.current-prize-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
}

.prize-header h3 {
  color: #ffd700;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.prize-content h4 {
  color: white;
  margin: 0 0 8px 0;
  font-size: 1.3rem;
}

.prize-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
  font-size: 0.9rem;
}

.prize-stats {
  display: flex;
  gap: 5px;
  font-size: 0.9rem;
}

.prize-stats .remaining {
  color: #ffd700;
  font-weight: 600;
}

.prize-stats .total {
  color: rgba(255, 255, 255, 0.7);
}

/* 统计概览 */
.stats-overview {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.stats-header h3 {
  color: white;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #4fc3f7;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

/* 奖品列表 */
.prize-section, .recent-winners {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-header h3 {
  color: white;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.prize-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prize-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prize-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(3px);
}

.prize-card.selected {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.3) 0%, rgba(100, 181, 246, 0.2) 100%);
  border-color: #409eff;
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.3);
}

.prize-name {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.prize-count {
  color: #4fc3f7;
  font-size: 0.8rem;
  font-weight: 600;
}

/* 最近中奖列表 */
.winners-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.winner-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 10px;
}

.winner-info strong {
  color: white;
  display: block;
  font-size: 0.9rem;
}

.winner-info small {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

/* 主抽奖舞台 */
.lottery-stage {
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.stage-container {
  flex: 1;
  position: relative;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
  min-height: 0;
  overflow: hidden;
}

.empty-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-content {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.empty-content .el-icon {
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 20px;
}

.empty-content h3 {
  color: white;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.empty-content p {
  margin: 0 0 30px 0;
  font-size: 1rem;
}

/* 控制面板 */
.control-panel {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  min-height: 100px;
  flex-shrink: 0;
}

.control-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 100%;
}

.draw-button {
  font-size: 1.1rem;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.draw-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(64, 158, 255, 0.4);
}

.control-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.4;
  word-break: break-word;
  max-width: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 280px 1fr;
  }

  .info-panel {
    padding: 15px;
  }
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 250px 1fr;
  }

  .info-panel {
    padding: 12px;
  }

  .current-prize-card,
  .stats-overview,
  .prize-section,
  .recent-winners {
    padding: 15px;
    margin-bottom: 15px;
  }

  .control-panel {
    padding: 15px;
  }

  .draw-button {
    font-size: 1rem;
    padding: 12px 25px;
  }

  .control-info {
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .top-nav {
    flex-direction: column;
    gap: 15px;
    padding: 15px 20px;
    height: auto;
  }

  .nav-right {
    justify-content: center;
    flex-wrap: wrap;
  }

  .main-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: calc(100vh - 100px);
  }

  .info-panel {
    order: 2;
    max-height: 180px;
    padding: 15px;
    overflow-y: auto;
  }

  .lottery-stage {
    order: 1;
    min-height: calc(100vh - 280px);
  }

  .control-panel {
    padding: 15px;
    min-height: 80px;
  }

  .control-content {
    gap: 8px;
  }

  .draw-button {
    font-size: 1rem;
    padding: 10px 25px;
  }

  .control-info {
    font-size: 0.8rem;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 8px 5px;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }

  .nav-left .site-title {
    font-size: 1.5rem;
  }

  .current-prize-card,
  .stats-overview,
  .prize-section,
  .recent-winners {
    margin-bottom: 15px;
    padding: 15px;
  }

  .prize-header h3,
  .stats-header h3,
  .section-header h3 {
    font-size: 1rem;
    margin-bottom: 10px;
  }
}
</style>
