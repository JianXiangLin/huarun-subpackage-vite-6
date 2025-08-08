<template>
  <div class="upload-test">
    <h2>Upload 组件测试</h2>

    <!-- 基础测试 -->
    <div class="test-section">
      <h3>基础功能测试</h3>
      <Upload v-model="testImage" :limit="1" />
      <p>上传结果: {{ testImage || '暂无' }}</p>
    </div>

    <!-- 多图测试 -->
    <div class="test-section">
      <h3>多图功能测试</h3>
      <Upload v-model="testImages" :limit="3" multiple />
      <p>上传结果: {{ testImages.length > 0 ? testImages.join(', ') : '暂无' }}</p>
    </div>

    <!-- 配置测试 -->
    <div class="test-section">
      <h3>配置测试</h3>
      <Upload v-model="configImage" :limit="1" tip="这是一个测试提示" placeholder="测试占位符" />
      <p>上传结果: {{ configImage || '暂无' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@/components/Upload'

const testImage = ref('')
const testImages = ref<string[]>([])
const configImage = ref('')
</script>

<style lang="less" scoped>
.upload-test {
  padding: 20px;

  h2 {
    margin-bottom: 20px;
    color: #303133;
  }

  .test-section {
    margin-bottom: 30px;
    padding: 15px;
    border: 1px solid #dcdfe6;
    border-radius: 6px;

    h3 {
      margin-bottom: 10px;
      color: #606266;
    }

    p {
      margin-top: 10px;
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>
