<template>
  <div class="error-test">
    <h3>错误处理测试</h3>

    <!-- 测试不同格式的错误 -->
    <div class="test-item">
      <h4>测试字符串错误</h4>
      <button @click="testStringError">触发字符串错误</button>
    </div>

    <div class="test-item">
      <h4>测试对象错误</h4>
      <button @click="testObjectError">触发对象错误</button>
    </div>

    <div class="test-item">
      <h4>测试无错误信息</h4>
      <button @click="testNoError">触发无错误信息</button>
    </div>

    <!-- 实际上传测试 -->
    <div class="test-item">
      <h4>实际上传测试</h4>
      <Upload
        v-model="testImage"
        action="https://invalid-url.com/upload"
        accept="image/*"
        @error="handleUploadError"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from './index'
import { ElMessage } from 'element-plus'

const testImage = ref('')

// 测试字符串错误
const testStringError = () => {
  const error = new Error('这是一个字符串错误信息')
  handleError(error)
}

// 测试对象错误
const testObjectError = () => {
  const error = new Error() as any
  error.message = {
    data: '这是来自对象data字段的错误信息'
  }
  handleError(error)
}

// 测试无错误信息
const testNoError = () => {
  const error = new Error()
  error.message = undefined
  handleError(error)
}

// 统一的错误处理函数
const handleError = (error: Error) => {
  console.log('原始错误:', error)

  // 处理错误信息
  let errorMessage = '上传失败'
  if (error.message) {
    if (typeof error.message === 'object' && error.message.data) {
      errorMessage = error.message.data
    } else if (typeof error.message === 'string') {
      errorMessage = error.message
    }
  }

  console.log('处理后的错误信息:', errorMessage)
  ElMessage.error(errorMessage)
}

// 实际上传错误处理
const handleUploadError = (error: Error, file: File, fileList: File[]) => {
  console.log('实际上传错误:', error)
  console.log('错误类型:', typeof error.message)
  console.log('错误内容:', error.message)
}
</script>

<style lang="less" scoped>
.error-test {
  padding: 20px;

  .test-item {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;

    h4 {
      margin: 0 0 10px 0;
      color: #303133;
    }

    button {
      padding: 8px 16px;
      background: #409eff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #337ecc;
      }
    }
  }
}
</style>
