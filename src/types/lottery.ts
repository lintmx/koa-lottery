// 抽奖人员接口
export interface Participant {
  id: string
  name: string
  isWon: boolean // 是否已中奖
}

// 奖品接口
export interface Prize {
  id: string
  name: string
  count: number // 奖品数量
  wonCount: number // 已中奖数量
}

// 抽奖结果接口
export interface LotteryResult {
  id: string
  prizeId: string
  prizeName: string
  participantId: string
  participantName: string
  timestamp: number
  roundNumber: number // 第几轮抽奖
}

// 抽奖设置接口
export interface LotterySettings {
  siteName: string
  animationDuration: number // 抽奖动画持续时间（毫秒）
  autoPlayMusic: boolean
  backgroundMusic?: string
}

// 抽奖状态
export interface LotteryState {
  participants: Participant[]
  prizes: Prize[]
  results: LotteryResult[]
  currentPrize: Prize | null
  isDrawing: boolean
  showResult: boolean // 是否显示抽奖结果
  settings: LotterySettings
}
