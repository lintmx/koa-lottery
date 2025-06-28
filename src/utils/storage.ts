import type { LotteryState } from '@/types/lottery'

const STORAGE_KEY = 'koa-lottery-data'

export class StorageService {
  // 保存数据到本地存储
  static saveData(data: LotteryState): void {
    try {
      const jsonData = JSON.stringify(data)
      localStorage.setItem(STORAGE_KEY, jsonData)
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }

  // 从本地存储读取数据
  static loadData(): LotteryState | null {
    try {
      const jsonData = localStorage.getItem(STORAGE_KEY)
      if (!jsonData) return null
      return JSON.parse(jsonData)
    } catch (error) {
      console.error('读取数据失败:', error)
      return null
    }
  }

  // 清空本地存储
  static clearData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('清空数据失败:', error)
    }
  }

  // 检查是否有存储的数据
  static hasData(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null
  }
}
