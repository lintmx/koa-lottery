import Papa from 'papaparse'
import type { Participant, Prize } from '@/types/lottery'
import { v4 as uuidv4 } from 'uuid'

export class CsvService {
  // 解析参与者CSV文件
  static parseParticipants(csvContent: string): Promise<Participant[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const participants: Participant[] = results.data.map((row: any, index: number) => ({
              id: uuidv4(),
              name: row.name || row['姓名'] || `参与者${index + 1}`,
              isWon: false
            }))
            resolve(participants)
          } catch (error) {
            reject(new Error('解析参与者数据失败: ' + error))
          }
        },
        error: (error: any) => {
          reject(new Error('CSV解析失败: ' + error.message))
        }
      })
    })
  }

  // 解析奖品CSV文件
  static parsePrizes(csvContent: string): Promise<Prize[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const prizes: Prize[] = results.data.map((row: any, index: number) => ({
              id: uuidv4(),
              name: row.name || row['奖品名称'] || `奖品${index + 1}`,
              count: parseInt(row.count || row['数量'] || '1'),
              wonCount: 0
            }))
            resolve(prizes)
          } catch (error) {
            reject(new Error('解析奖品数据失败: ' + error))
          }
        },
        error: (error: any) => {
          reject(new Error('CSV解析失败: ' + error.message))
        }
      })
    })
  }

  // 导出抽奖结果为CSV
  static exportResults(results: any[]): string {
    return Papa.unparse(results, {
      header: true
    })
  }

  // 下载CSV文件
  static downloadCsv(content: string, filename: string): void {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  // 生成参与者CSV模板
  static generateParticipantTemplate(): string {
    const template = [
      { name: '张三' },
      { name: '李四' },
      { name: '王五' }
    ]
    return Papa.unparse(template, { header: true })
  }

  // 生成奖品CSV模板
  static generatePrizeTemplate(): string {
    const template = [
      { name: '手机', count: 1 },
      { name: '平板', count: 2 },
      { name: '耳机', count: 5 }
    ]
    return Papa.unparse(template, { header: true })
  }
}
