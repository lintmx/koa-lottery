<template>
  <el-dialog
    v-model="visible"
    title="抽奖设置"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="120px" class="settings-form">
      <el-form-item label="网站名称">
        <el-input
          v-model="formData.siteName"
          placeholder="请输入网站名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="抽奖动画时长">
        <el-slider
          v-model="formData.animationDuration"
          :min="1000"
          :max="10000"
          :step="500"
          :format-tooltip="formatDuration"
          show-input
          :show-input-controls="false"
        />
        <div class="form-tip">
          控制抽奖动画的持续时间，建议3-5秒
        </div>
      </el-form-item>

      <el-form-item label="自动播放音乐">
        <el-switch
          v-model="formData.autoPlayMusic"
          active-text="开启"
          inactive-text="关闭"
        />
        <div class="form-tip">
          开启后将在抽奖时自动播放背景音乐
        </div>
      </el-form-item>

      <el-form-item label="背景音乐" v-if="formData.autoPlayMusic">
        <el-input
          v-model="formData.backgroundMusic"
          placeholder="请输入音乐文件URL"
        />
        <div class="form-tip">
          支持MP3、WAV等音频格式的URL链接
        </div>
      </el-form-item>

      <el-divider content-position="left">数据管理</el-divider>

      <el-form-item label="导出数据">
        <el-button @click="exportData" type="success" :icon="Download">
          导出所有数据
        </el-button>
        <div class="form-tip">
          导出参与者、奖品和抽奖结果数据
        </div>
      </el-form-item>

      <el-form-item label="导入数据">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          accept=".json"
          :on-change="handleDataImport"
        >
          <el-button type="info" :icon="Upload">
            选择数据文件
          </el-button>
        </el-upload>
        <div class="form-tip">
          导入之前导出的JSON数据文件
        </div>
      </el-form-item>

      <el-form-item label="重置数据">
        <el-button @click="confirmReset" type="danger" :icon="Delete">
          清空所有数据
        </el-button>
        <div class="form-tip warning">
          ⚠️ 此操作将清除所有参与者、奖品和抽奖结果，请谨慎操作
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="saveSettings" type="primary">
          保存设置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, Delete } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { useLotteryStore } from '@/stores/lottery'
import type { LotterySettings, LotteryState } from '@/types/lottery'

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

const formData = ref<LotterySettings>({
  siteName: '',
  animationDuration: 3000,
  autoPlayMusic: false,
  backgroundMusic: ''
})

// 格式化动画时长显示
const formatDuration = (value: number) => {
  return `${(value / 1000).toFixed(1)}秒`
}

// 导出数据
const exportData = () => {
  try {
    const data: LotteryState = {
      participants: lotteryStore.participants,
      prizes: lotteryStore.prizes,
      results: lotteryStore.results,
      currentPrize: lotteryStore.currentPrize,
      isDrawing: lotteryStore.isDrawing,
      settings: lotteryStore.settings
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `抽奖数据_${new Date().toISOString().split('T')[0]}.json`
    link.click()

    URL.revokeObjectURL(url)
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('数据导出失败: ' + (error as Error).message)
  }
}

// 处理数据导入
const handleDataImport = async (file: UploadFile) => {
  if (!file.raw) return

  // 检查文件类型
  if (!file.name.toLowerCase().endsWith('.json')) {
    ElMessage.error('只支持JSON文件格式')
    return
  }

  try {
    const text = await readFileAsText(file.raw)
    const data: LotteryState = JSON.parse(text)

    // 验证数据格式
    if (!data.participants || !data.prizes || !data.results || !data.settings) {
      throw new Error('数据格式不正确')
    }

    await ElMessageBox.confirm(
      '导入数据将覆盖当前所有数据，确定要继续吗？',
      '确认导入',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 导入数据
    lotteryStore.setParticipants(data.participants)
    lotteryStore.setPrizes(data.prizes)
    lotteryStore.results = data.results
    lotteryStore.updateSettings(data.settings)

    // 更新表单数据
    formData.value = { ...data.settings }

    ElMessage.success('数据导入成功')
  } catch (error) {
    if ((error as Error).message !== 'cancel') {
      ElMessage.error('数据导入失败: ' + (error as Error).message)
    }
  }
}

// 读取文件内容
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('无法读取文件内容'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'utf-8')
  })
}

// 确认重置数据
const confirmReset = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将清除所有参与者、奖品和抽奖结果数据，且无法恢复。确定要继续吗？',
      '确认重置',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    lotteryStore.resetAll()
    ElMessage.success('数据重置成功')
    handleClose()
  } catch {
    // 用户取消操作
  }
}

// 保存设置
const saveSettings = () => {
  lotteryStore.updateSettings(formData.value)
  ElMessage.success('设置保存成功')
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 监听对话框显示状态
watch(visible, (newValue) => {
  if (newValue) {
    // 打开时加载当前设置
    formData.value = { ...lotteryStore.settings }
  }
})
</script>

<style scoped>
.settings-form {
  padding: 20px 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.form-tip.warning {
  color: #e6a23c;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-slider) {
  margin-right: 20px;
}

:deep(.el-slider__input) {
  width: 80px;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #409eff;
}
</style>
