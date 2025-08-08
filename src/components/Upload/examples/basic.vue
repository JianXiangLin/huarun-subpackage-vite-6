<template>
  <div class="upload-examples">
    <h2>Upload 组件使用示例</h2>

    <!-- 单图上传 -->
    <div class="example-section">
      <h3>单图上传</h3>
      <Upload v-model="singleImage" :limit="1" />
      <p>当前值: {{ singleImage }}</p>
    </div>

    <!-- 多图上传 -->
    <div class="example-section">
      <h3>多图上传</h3>
      <Upload v-model="multipleImages" :limit="5" multiple />
      <p>当前值: {{ multipleImages }}</p>
    </div>

    <!-- 自定义上传地址 -->
    <div class="example-section">
      <h3>自定义上传地址</h3>
      <Upload v-model="customUrlImage" upload-url="/api/custom/upload" :limit="1" />
      <p>当前值: {{ customUrlImage }}</p>
    </div>

    <!-- 自定义请求头 -->
    <div class="example-section">
      <h3>自定义请求头</h3>
      <Upload v-model="customHeadersImage" :upload-headers="customHeaders" :limit="1" />
      <p>当前值: {{ customHeadersImage }}</p>
    </div>

    <!-- 自定义提示 -->
    <div class="example-section">
      <h3>自定义提示</h3>
      <Upload v-model="tipImage" tip="支持 jpg、png 格式，文件大小不超过 2MB" :limit="1" />
      <p>当前值: {{ tipImage }}</p>
    </div>

    <!-- 自定义触发器 -->
    <div class="example-section">
      <h3>自定义触发器</h3>
      <Upload v-model="customTriggerImage" :limit="1">
        <template #trigger="{ fileList }">
          <div class="custom-trigger">
            <el-icon><Plus /></el-icon>
            <span>自定义上传按钮</span>
          </div>
        </template>
      </Upload>
      <p>当前值: {{ customTriggerImage }}</p>
    </div>

    <!-- 禁用状态 -->
    <div class="example-section">
      <h3>禁用状态</h3>
      <Upload v-model="disabledImage" :limit="1" disabled />
      <p>当前值: {{ disabledImage }}</p>
    </div>

    <!-- 事件处理 -->
    <div class="example-section">
      <h3>事件处理</h3>
      <Upload
        v-model="eventImage"
        :limit="1"
        @success="handleSuccess"
        @error="handleError"
        @change="handleChange"
        @remove="handleRemove"
      />
      <p>当前值: {{ eventImage }}</p>
      <p>事件日志: {{ eventLog }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@/components/Upload'
import { Plus } from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles } from 'element-plus'

// 响应式数据
const singleImage = ref('')
const multipleImages = ref<string[]>([])
const customUrlImage = ref('')
const customHeadersImage = ref('')
const tipImage = ref('')
const customTriggerImage = ref('')
const disabledImage = ref('')
const eventImage = ref('')
const eventLog = ref<string[]>([])

// 自定义请求头
const customHeaders = {
  'X-Custom-Header': 'custom-value',
  'X-API-Version': 'v2'
}

// 事件处理函数
const handleSuccess = (response: any, file: UploadFile, fileList: UploadFiles) => {
  eventLog.value.push(`上传成功: ${file.name}`)
}

const handleError = (error: Error, file: UploadFile, fileList: UploadFiles) => {
  eventLog.value.push(`上传失败: ${file.name} - ${error.message}`)
}

const handleChange = (file: UploadFile, fileList: UploadFiles) => {
  eventLog.value.push(`文件变化: ${file.name}`)
}

const handleRemove = (file: UploadFile, fileList: UploadFiles) => {
  eventLog.value.push(`文件移除: ${file.name}`)
}
</script>

<style lang="less" scoped>
.upload-examples {
  padding: 20px;

  h2 {
    margin-bottom: 30px;
    color: #303133;
  }

  .example-section {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;

    h3 {
      margin-bottom: 15px;
      color: #606266;
    }

    p {
      margin-top: 10px;
      color: #909399;
      font-size: 14px;
    }
  }

  .custom-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 178px;
    height: 178px;
    border: 2px dashed #409eff;
    border-radius: 8px;
    background: #f0f9ff;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: #e6f7ff;
      border-color: #1890ff;
    }

    .el-icon {
      font-size: 32px;
      color: #409eff;
      margin-bottom: 8px;
    }

    span {
      color: #409eff;
      font-size: 14px;
    }
  }

  .event-log {
    max-height: 200px;
    overflow-y: auto;
    background: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
}
</style>
