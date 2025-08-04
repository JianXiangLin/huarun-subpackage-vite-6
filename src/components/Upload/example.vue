<template>
  <div class="upload-examples">
    <h3>Upload 组件使用示例</h3>

    <!-- 单文件上传 -->
    <div class="example-item">
      <h4>单文件上传</h4>
      <Upload
        v-model="singleImage"
        action="https://test.hlsports.net/api/upload/pic"
        accept="image/*"
        :max-size="5"
        :show-file-list="false"
        @success="handleSingleSuccess"
      />
      <p>当前值: {{ singleImage }}</p>
    </div>

    <!-- 多文件上传 -->
    <div class="example-item">
      <h4>多文件上传</h4>
      <Upload
        v-model="multipleImages"
        action="https://test.hlsports.net/api/upload/pic"
        :multiple="true"
        accept="image/*"
        :limit="3"
        :max-size="5"
        @success="handleMultipleSuccess"
        @exceed="handleExceed"
      />
      <p>当前值: {{ multipleImages }}</p>
    </div>

    <!-- 拖拽上传 -->
    <div class="example-item">
      <h4>拖拽上传</h4>
      <Upload
        v-model="dragImage"
        action="https://test.hlsports.net/api/upload/pic"
        :drag="true"
        accept="image/*"
        :max-size="5"
        @success="handleDragSuccess"
      />
      <p>当前值: {{ dragImage }}</p>
    </div>

    <!-- 自定义验证 -->
    <div class="example-item">
      <h4>自定义验证上传</h4>
      <Upload
        v-model="customImage"
        action="https://test.hlsports.net/api/upload/pic"
        accept="image/*"
        :max-size="2"
        :before-upload="customBeforeUpload"
        @success="handleCustomSuccess"
      />
      <p>当前值: {{ customImage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from './index'
import { ElMessage } from 'element-plus'

const singleImage = ref('')
const multipleImages = ref<string[]>([])
const dragImage = ref('')
const customImage = ref('')

const handleSingleSuccess = (response: any, file: File, fileList: File[]) => {
  console.log('单文件上传成功:', response)
  ElMessage.success('单文件上传成功')
}

const handleMultipleSuccess = (response: any, file: File, fileList: File[]) => {
  console.log('多文件上传成功:', response)
  ElMessage.success('多文件上传成功')
}

const handleDragSuccess = (response: any, file: File, fileList: File[]) => {
  console.log('拖拽上传成功:', response)
  ElMessage.success('拖拽上传成功')
}

const handleCustomSuccess = (response: any, file: File, fileList: File[]) => {
  console.log('自定义验证上传成功:', response)
  ElMessage.success('自定义验证上传成功')
}

const handleExceed = (files: File[], fileList: File[]) => {
  ElMessage.warning('文件数量超出限制')
}

const customBeforeUpload = (file: File) => {
  // 自定义验证：只允许上传jpg和png格式
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }

  // 检查文件大小（2MB）
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }

  return true
}
</script>

<style lang="less" scoped>
.upload-examples {
  padding: 20px;

  .example-item {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;

    h4 {
      margin: 0 0 15px 0;
      color: #303133;
    }

    p {
      margin: 10px 0 0 0;
      color: #606266;
      font-size: 14px;
    }
  }
}
</style>
