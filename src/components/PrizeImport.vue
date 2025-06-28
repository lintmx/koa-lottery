<template>
  <el-dialog
    v-model="visible"
    title="导入奖品"
    width="600px"
    @close="handleClose"
  >
    <div class="import-container">
      <el-tabs v-model="activeTab" class="import-tabs">
        <!-- CSV文件导入 -->
        <el-tab-pane label="CSV文件导入" name="file">
          <div class="tab-content">
            <div class="upload-section">
              <el-upload
                ref="uploadRef"
                class="upload-dragger"
                drag
                :auto-upload="false"
                :show-file-list="false"
                accept=".csv"
                :on-change="handleFileChange"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将CSV文件拖到此处，或<em>点击上传</em>
                </div>
                <div class="el-upload__tip">
                  只支持CSV格式文件，文件大小不超过2MB
                </div>
              </el-upload>
            </div>

            <div class="file-info" v-if="selectedFile">
              <h4>已选择文件: {{ selectedFile.name }}</h4>
              <el-button @click="parseFile" type="primary" :loading="parsing">
                解析文件
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 手动输入 -->
        <el-tab-pane label="手动输入" name="manual">
          <div class="tab-content">
            <el-form :model="manualForm" label-width="80px">
              <el-form-item label="奖品名称" required>
                <el-input v-model="manualForm.name" placeholder="请输入奖品名称" />
              </el-form-item>
              <el-form-item label="奖品数量" required>
                <el-input-number
                  v-model="manualForm.count"
                  :min="1"
                  :max="1000"
                  placeholder="请输入奖品数量"
                />
              </el-form-item>
              <el-form-item>
                <el-button @click="addManualPrize" type="primary" :disabled="!manualForm.name.trim() || !manualForm.count">
                  添加奖品
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- CSV模板 -->
        <el-tab-pane label="CSV模板" name="template">
          <div class="tab-content">
            <div class="template-info">
              <h4>CSV文件格式说明</h4>
              <p>CSV文件应包含以下列（支持中英文列名）：</p>
              <ul>
                <li><strong>name 或 奖品名称</strong>: 奖品名称（必填）</li>
                <li><strong>count 或 数量</strong>: 奖品数量（必填，数字）</li>
              </ul>
            </div>

            <div class="template-actions">
              <el-button @click="downloadTemplate" type="success">
                下载CSV模板
              </el-button>
            </div>

            <div class="template-preview">
              <h4>模板预览</h4>
              <el-table :data="templateData" border style="width: 100%">
                <el-table-column prop="name" label="奖品名称" />
                <el-table-column prop="count" label="数量" width="80" />
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 解析结果预览 -->
      <div class="preview-section" v-if="parsedPrizes.length > 0">
        <h3>导入预览 ({{ parsedPrizes.length }} 个奖品)</h3>
        <div class="preview-table">
          <el-table
            :data="parsedPrizes"
            border
            max-height="300"
            style="width: 100%"
          >
            <el-table-column prop="name" label="奖品名称" />
            <el-table-column prop="count" label="数量" width="80" align="center" />
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button
                  @click="removePrize($index)"
                  type="danger"
                  size="small"
                  text
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          @click="confirmImport"
          type="primary"
          :disabled="parsedPrizes.length === 0"
        >
          确认导入 ({{ parsedPrizes.length }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import type { Prize } from '@/types/lottery'
import { CsvService } from '@/utils/csv'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'importSuccess', prizes: Prize[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = ref('file')
const selectedFile = ref<UploadFile | null>(null)
const parsing = ref(false)
const parsedPrizes = ref<Prize[]>([])

const manualForm = ref({
  name: '',
  count: 1
})

const templateData = [
  { name: '手机', count: 1 },
  { name: '平板', count: 2 },
  { name: '耳机', count: 5 }
]

// 处理文件选择
const handleFileChange = (file: UploadFile) => {
  if (!file.raw) return

  // 检查文件类型
  if (!file.name.toLowerCase().endsWith('.csv')) {
    ElMessage.error('只支持CSV文件格式')
    return
  }

  // 检查文件大小 (2MB)
  if (file.size && file.size > 2 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过2MB')
    return
  }

  selectedFile.value = file
}

// 解析CSV文件
const parseFile = async () => {
  if (!selectedFile.value?.raw) return

  parsing.value = true
  try {
    const text = await readFileAsText(selectedFile.value.raw)
    const prizes = await CsvService.parsePrizes(text)
    parsedPrizes.value = prizes
    ElMessage.success(`成功解析 ${prizes.length} 个奖品`)
  } catch (error) {
    ElMessage.error('文件解析失败: ' + (error as Error).message)
  } finally {
    parsing.value = false
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

// 添加手动输入的奖品
const addManualPrize = () => {
  if (!manualForm.value.name.trim()) {
    ElMessage.warning('请输入奖品名称')
    return
  }

  if (manualForm.value.count < 1) {
    ElMessage.warning('奖品数量必须大于0')
    return
  }

  const prize: Prize = {
    id: uuidv4(),
    name: manualForm.value.name.trim(),
    count: manualForm.value.count,
    wonCount: 0
  }

  parsedPrizes.value.push(prize)

  // 清空表单
  manualForm.value = {
    name: '',
    count: 1
  }

  ElMessage.success('奖品添加成功')
}

// 删除奖品
const removePrize = (index: number) => {
  parsedPrizes.value.splice(index, 1)
}

// 下载CSV模板
const downloadTemplate = () => {
  const templateCsv = CsvService.generatePrizeTemplate()
  CsvService.downloadCsv(templateCsv, '奖品导入模板.csv')
}

// 确认导入
const confirmImport = () => {
  if (parsedPrizes.value.length === 0) {
    ElMessage.warning('没有可导入的奖品数据')
    return
  }

  emit('importSuccess', [...parsedPrizes.value])
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  // 重置状态
  selectedFile.value = null
  parsedPrizes.value = []
  activeTab.value = 'file'
  manualForm.value = {
    name: '',
    count: 1
  }
}

// 监听对话框显示状态
watch(visible, (newValue) => {
  if (!newValue) {
    handleClose()
  }
})
</script>

<style scoped>
.import-container {
  min-height: 400px;
}

.import-tabs {
  margin-bottom: 20px;
}

.tab-content {
  padding: 20px 0;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-dragger {
  width: 100%;
}

.upload-dragger .el-upload {
  width: 100%;
}

.upload-dragger .el-upload-dragger {
  width: 100%;
  height: 180px;
}

.file-info {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.file-info h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.template-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  margin-bottom: 20px;
}

.template-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.template-info p {
  margin: 0 0 10px 0;
  color: #666;
}

.template-info ul {
  margin: 0;
  padding-left: 20px;
}

.template-info li {
  margin-bottom: 5px;
  color: #555;
}

.template-actions {
  text-align: center;
  margin-bottom: 20px;
}

.template-preview h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.preview-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.preview-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
}

.preview-table {
  border-radius: 8px;
  overflow: hidden;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
