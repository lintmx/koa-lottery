import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Participant, Prize, LotteryResult, LotterySettings, LotteryState } from '@/types/lottery'
import { StorageService } from '@/utils/storage'
import { v4 as uuidv4 } from 'uuid'

export const useLotteryStore = defineStore('lottery', () => {
  // 状态
  const participants = ref<Participant[]>([])
  const prizes = ref<Prize[]>([])
  const results = ref<LotteryResult[]>([])
  const currentPrize = ref<Prize | null>(null)
  const isDrawing = ref(false)
  const showResult = ref(false) // 是否显示抽奖结果
  const settings = ref<LotterySettings>({
    siteName: 'KOA 季度新番抽奖',
    animationDuration: 3000,
    autoPlayMusic: false,
    backgroundMusic: ''
  })

  // 计算属性
  const availableParticipants = computed(() =>
    participants.value.filter(p => !p.isWon)
  )

  const availablePrizes = computed(() =>
    prizes.value.filter(p => p.wonCount < p.count)
  )

  const totalParticipants = computed(() => participants.value.length)
  const totalPrizes = computed(() => prizes.value.reduce((sum, p) => sum + p.count, 0))
  const totalResults = computed(() => results.value.length)

  // 获取下一轮次号
  const getNextRoundNumber = () => {
    if (results.value.length === 0) return 1
    return Math.max(...results.value.map(r => r.roundNumber)) + 1
  }

  // 加载数据
  const loadData = () => {
    const savedData = StorageService.loadData()
    if (savedData) {
      participants.value = savedData.participants
      prizes.value = savedData.prizes
      results.value = savedData.results
      showResult.value = savedData.showResult || false
      settings.value = { ...settings.value, ...savedData.settings }
    }
  }

  // 保存数据
  const saveData = () => {
    const data: LotteryState = {
      participants: participants.value,
      prizes: prizes.value,
      results: results.value,
      currentPrize: currentPrize.value,
      isDrawing: isDrawing.value,
      showResult: showResult.value,
      settings: settings.value
    }
    StorageService.saveData(data)
  }

  // 设置参与者
  const setParticipants = (newParticipants: Participant[]) => {
    participants.value = newParticipants
    saveData()
  }

  // 设置奖品
  const setPrizes = (newPrizes: Prize[]) => {
    prizes.value = newPrizes
    saveData()
  }

  // 开始抽奖
  const startDraw = (prize: Prize) => {
    if (isDrawing.value) return false
    if (availableParticipants.value.length === 0) return false
    if (prize.wonCount >= prize.count) return false

    currentPrize.value = prize
    isDrawing.value = true
    showResult.value = false // 重置结果显示状态
    return true
  }

  // 完成抽奖
  const completeDraw = (participant: Participant) => {
    if (!currentPrize.value || !isDrawing.value) return false

    // 创建抽奖结果
    const result: LotteryResult = {
      id: uuidv4(),
      prizeId: currentPrize.value.id,
      prizeName: currentPrize.value.name,
      participantId: participant.id,
      participantName: participant.name,
      timestamp: Date.now(),
      roundNumber: getNextRoundNumber()
    }

    // 更新状态
    results.value.push(result)
    participant.isWon = true
    currentPrize.value.wonCount++

    // 设置为显示结果状态，但不重置抽奖状态
    isDrawing.value = false
    showResult.value = true
    // 保持 currentPrize，不清空，用于显示结果

    saveData()
    return true
  }

  // 隐藏抽奖结果
  const hideResult = () => {
    showResult.value = false
    currentPrize.value = null
    saveData()
  }

  // 删除抽奖结果并重抽
  const removeResult = (resultId: string) => {
    const resultIndex = results.value.findIndex(r => r.id === resultId)
    if (resultIndex === -1) return false

    const result = results.value[resultIndex]

    // 恢复参与者状态
    const participant = participants.value.find(p => p.id === result.participantId)
    if (participant) {
      participant.isWon = false
    }

    // 恢复奖品数量
    const prize = prizes.value.find(p => p.id === result.prizeId)
    if (prize) {
      prize.wonCount--
    }

    // 删除结果
    results.value.splice(resultIndex, 1)

    saveData()
    return true
  }

  // 重置所有数据
  const resetAll = () => {
    participants.value = []
    prizes.value = []
    results.value = []
    currentPrize.value = null
    isDrawing.value = false
    showResult.value = false
    StorageService.clearData()
  }

  // 更新设置
  const updateSettings = (newSettings: Partial<LotterySettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveData()
  }

  // 获取特定奖品的中奖结果
  const getResultsByPrize = (prizeId: string) => {
    return results.value.filter(r => r.prizeId === prizeId)
  }

  // 获取抽奖统计信息
  const getStatistics = () => {
    return {
      totalParticipants: totalParticipants.value,
      remainingParticipants: availableParticipants.value.length,
      totalPrizes: totalPrizes.value,
      remainingPrizes: availablePrizes.value.reduce((sum, p) => sum + (p.count - p.wonCount), 0),
      totalResults: totalResults.value,
      completionRate: totalParticipants.value > 0 ? (totalResults.value / totalParticipants.value * 100).toFixed(1) : '0'
    }
  }

  return {
    // 状态
    participants,
    prizes,
    results,
    currentPrize,
    isDrawing,
    showResult,
    settings,

    // 计算属性
    availableParticipants,
    availablePrizes,
    totalParticipants,
    totalPrizes,
    totalResults,

    // 方法
    loadData,
    saveData,
    setParticipants,
    setPrizes,
    startDraw,
    completeDraw,
    hideResult,
    removeResult,
    resetAll,
    updateSettings,
    getResultsByPrize,
    getStatistics
  }
})
