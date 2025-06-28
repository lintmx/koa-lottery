<template>
  <el-dialog
    v-model="visible"
    title="抽奖结果"
    width="80%"
    @close="handleClose"
  >
    <div class="results-container">
      <!-- 结果统计 -->
      <div class="stats-overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总参与人数" :value="statistics.totalParticipants" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="中奖人数" :value="statistics.totalResults" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="中奖率" :value="statistics.completionRate" suffix="%" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="剩余奖品" :value="statistics.remainingPrizes" />
          </el-col>
        </el-row>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="exportResults" type="success" :icon="Download">
          导出结果
        </el-button>
        <el-button @click="printResults" type="info" :icon="Printer">
          打印结果
        </el-button>
        <el-select
          v-model="selectedPrizeFilter"
          placeholder="按奖品筛选"
          clearable
          style="width: 200px; margin-left: 10px;"
        >
          <el-option
            v-for="prize in lotteryStore.prizes"
            :key="prize.id"
            :label="prize.name"
            :value="prize.id"
          />
        </el-select>
      </div>

      <!-- 结果列表 -->
      <div class="results-table">
        <el-table
          :data="filteredResults"
          border
          stripe
          max-height="500"
          @sort-change="handleSort"
        >
          <el-table-column
            prop="roundNumber"
            label="轮次"
            width="80"
            sortable="custom"
          />
          <el-table-column
            prop="prizeName"
            label="奖品"
            width="150"
            sortable="custom"
          />
          <el-table-column
            prop="participantName"
            label="中奖者"
            width="120"
            sortable="custom"
          />
          <el-table-column
            prop="participantEmail"
            label="邮箱"
            width="180"
            :formatter="emailFormatter"
          />
          <el-table-column
            prop="participantDepartment"
            label="部门"
            width="120"
            :formatter="departmentFormatter"
          />
          <el-table-column
            prop="timestamp"
            label="中奖时间"
            width="180"
            sortable="custom"
            :formatter="timeFormatter"
          />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                @click="removeResult(row.id)"
                type="danger"
                size="small"
                text
                :icon="Delete"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 按奖品分组查看 -->
      <div class="prize-groups" v-if="!selectedPrizeFilter">
        <h3>按奖品分组</h3>
        <el-collapse v-model="activeCollapse">
          <el-collapse-item
            v-for="group in prizeGroups"
            :key="group.prizeId"
            :name="group.prizeId"
          >
            <template #title>
              <div class="group-title">
                <span class="prize-name">{{ group.prizeName }}</span>
                <el-tag type="primary" class="prize-count">
                  {{ group.results.length }} / {{ group.totalCount }}
                </el-tag>
              </div>
            </template>
            <div class="group-content">
              <el-table :data="group.results" size="small">
                <el-table-column prop="participantName" label="中奖者" />
                <el-table-column prop="participantEmail" label="邮箱" />
                <el-table-column prop="participantDepartment" label="部门" />
                <el-table-column
                  prop="timestamp"
                  label="中奖时间"
                  :formatter="timeFormatter"
                />
              </el-table>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Printer, Delete } from '@element-plus/icons-vue'
import { useLotteryStore } from '@/stores/lottery'
import { CsvService } from '@/utils/csv'
import type { LotteryResult } from '@/types/lottery'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const lotteryStore = useLotteryStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectedPrizeFilter = ref('')
const activeCollapse = ref<string[]>([])
const sortField = ref('')
const sortOrder = ref('')

// 计算属性
const statistics = computed(() => lotteryStore.getStatistics())

const filteredResults = computed(() => {
  let results = [...lotteryStore.results]

  // 按奖品筛选
  if (selectedPrizeFilter.value) {
    results = results.filter(r => r.prizeId === selectedPrizeFilter.value)
  }

  // 排序
  if (sortField.value && sortOrder.value) {
    results.sort((a, b) => {
      let aValue: any = a[sortField.value as keyof LotteryResult]
      let bValue: any = b[sortField.value as keyof LotteryResult]

      if (sortField.value === 'timestamp') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder.value === 'ascending') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  } else {
    // 默认按时间倒序
    results.sort((a, b) => b.timestamp - a.timestamp)
  }

  return results
})

const prizeGroups = computed(() => {
  const groups = lotteryStore.prizes.map(prize => {
    const results = lotteryStore.results.filter(r => r.prizeId === prize.id)
    return {
      prizeId: prize.id,
      prizeName: prize.name,
      totalCount: prize.count,
      results: results.map(r => ({
        ...r,
        participantEmail: getParticipantEmail(r.participantId),
        participantDepartment: getParticipantDepartment(r.participantId)
      }))
    }
  })

  return groups.filter(g => g.results.length > 0)
})

// 获取参与者邮箱
const getParticipantEmail = (participantId: string) => {
  const participant = lotteryStore.participants.find(p => p.id === participantId)
  return participant?.email || '-'
}

// 获取参与者部门
const getParticipantDepartment = (participantId: string) => {
  const participant = lotteryStore.participants.find(p => p.id === participantId)
  return participant?.department || '-'
}

// 表格格式化函数
const emailFormatter = (row: LotteryResult) => {
  return getParticipantEmail(row.participantId)
}

const departmentFormatter = (row: LotteryResult) => {
  return getParticipantDepartment(row.participantId)
}

const timeFormatter = (row: LotteryResult) => {
  return new Date(row.timestamp).toLocaleString('zh-CN')
}

// 处理排序
const handleSort = ({ prop, order }: { prop: string; order: string | null }) => {
  sortField.value = prop
  sortOrder.value = order || ''
}

// 导出结果
const exportResults = () => {
  try {
    const exportData = filteredResults.value.map(result => ({
      轮次: result.roundNumber,
      奖品: result.prizeName,
      中奖者: result.participantName,
      邮箱: getParticipantEmail(result.participantId),
      部门: getParticipantDepartment(result.participantId),
      中奖时间: new Date(result.timestamp).toLocaleString('zh-CN')
    }))

    const csvContent = CsvService.exportResults(exportData)
    const filename = selectedPrizeFilter.value
      ? `${lotteryStore.prizes.find(p => p.id === selectedPrizeFilter.value)?.name || '筛选'}_抽奖结果_${new Date().toISOString().split('T')[0]}.csv`
      : `抽奖结果_${new Date().toISOString().split('T')[0]}.csv`

    CsvService.downloadCsv(csvContent, filename)
    ElMessage.success('结果导出成功')
  } catch (error) {
    ElMessage.error('结果导出失败: ' + (error as Error).message)
  }
}

// 打印结果
const printResults = () => {
  const printContent = generatePrintContent()
  const printWindow = window.open('', '_blank')

  if (printWindow) {
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

// 生成打印内容
const generatePrintContent = () => {
  const title = selectedPrizeFilter.value
    ? `${lotteryStore.prizes.find(p => p.id === selectedPrizeFilter.value)?.name || '筛选'} - 抽奖结果`
    : `${lotteryStore.settings.siteName} - 抽奖结果`

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .stats { margin-bottom: 20px; }
        .stats div { display: inline-block; margin-right: 20px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="stats">
        <div><strong>总参与人数:</strong> ${statistics.value.totalParticipants}</div>
        <div><strong>中奖人数:</strong> ${statistics.value.totalResults}</div>
        <div><strong>中奖率:</strong> ${statistics.value.completionRate}%</div>
        <div><strong>打印时间:</strong> ${new Date().toLocaleString('zh-CN')}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>轮次</th>
            <th>奖品</th>
            <th>中奖者</th>
            <th>邮箱</th>
            <th>部门</th>
            <th>中奖时间</th>
          </tr>
        </thead>
        <tbody>
  `

  filteredResults.value.forEach(result => {
    html += `
      <tr>
        <td>${result.roundNumber}</td>
        <td>${result.prizeName}</td>
        <td>${result.participantName}</td>
        <td>${getParticipantEmail(result.participantId)}</td>
        <td>${getParticipantDepartment(result.participantId)}</td>
        <td>${new Date(result.timestamp).toLocaleString('zh-CN')}</td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `

  return html
}

// 删除结果
const removeResult = async (resultId: string) => {
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

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 监听对话框显示状态
watch(visible, (newValue) => {
  if (newValue) {
    // 重置筛选和排序
    selectedPrizeFilter.value = ''
    sortField.value = ''
    sortOrder.value = ''
    activeCollapse.value = []
  }
})
</script>

<style scoped>
.results-container {
  padding: 20px 0;
}

.stats-overview {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.results-table {
  margin-bottom: 30px;
}

.prize-groups h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
}

.group-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.prize-name {
  font-weight: 600;
  color: #333;
}

.prize-count {
  margin-left: 10px;
}

.group-content {
  padding: 15px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-statistic__content) {
  font-size: 1.5rem;
  font-weight: bold;
  color: #409eff;
}

:deep(.el-statistic__title) {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

:deep(.el-collapse-item__header) {
  padding-left: 0;
  padding-right: 0;
}
</style>
