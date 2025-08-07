<template>
  <div class="upload-component">
    <!-- 多图模式 -->
    <div class="upload-multiple-mode">
      <!-- 多图展示区域 -->
      <div class="upload-preview">
        <div class="upload-preview-list">
          <div
            v-for="(file, index) in fileList"
            :key="file.uid || index"
            class="upload-preview-item"
          >
            <div class="upload-preview-image">
              <img
                v-if="file.url && file.url.indexOf('http') !== -1"
                :src="file.url"
                :alt="file.name"
              />
              <div class="upload-preview-actions">
                <el-icon
                  :size="32"
                  class="upload-preview-remove"
                  @click="handleRemove(file, fileList)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
          </div>
          <!-- 多图上传组件 - 放在图片后面 -->
          <div>
            <el-upload
              v-if="fileList.length < props.limit"
              v-bind="uploadProps"
              :file-list="fileList"
              :on-success="handleSuccess"
              :on-error="handleError"
              :on-change="handleChange"
              :on-remove="handleRemove"
              :on-exceed="handleExceed"
              :before-upload="handleBeforeUpload"
              :before-remove="handleBeforeRemove"
              :on-progress="handleProgress"
            >
              <slot name="trigger" :file-list="fileList">
                <div class="upload-trigger">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <div class="upload-text">{{ placeholder || '点击上传' }}</div>
                </div>
              </slot>

              <template #tip>
                <slot name="tip">
                  <div v-if="tip" class="upload-tip">{{ tip }}</div>
                </slot>
              </template>
            </el-upload>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { ElUpload, ElIcon, ElMessage, ElLoading } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { UploadFile, UploadFiles, UploadProps } from 'element-plus'
import type { UploadComponentProps, UploadEmits } from './types'

let loading: any

interface Props extends UploadComponentProps {
  modelValue?: string | string[] | UploadFiles
  fileList?: UploadFiles
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  fileList: () => [],
  multiple: false,
  listType: 'text',
  limit: 1,
  accept: 'image/*',
  showFileList: true,
  drag: false,
  disabled: false,
  autoUpload: true
})

const emit = defineEmits<UploadEmits>()

// 内部文件列表
const internalFileList = ref<UploadFiles>([])

// 计算属性
const fileList = computed(() => {
  // 如果外部传入了 fileList，优先使用外部的
  if (props.fileList && props.fileList.length > 0) {
    return props.fileList
  }
  // 否则使用内部的 fileList
  return internalFileList.value
})

const isMultiple = computed(() => {
  return props.multiple || props.limit > 1
})

const hasFiles = computed(() => {
  return fileList.value.length > 0
})

// 上传组件属性
const uploadProps = computed(() => {
  const { modelValue, fileList, ...rest } = props
  return {
    ...rest,
    'onUpdate:fileList': (files: UploadFiles) => {
      // 只有在没有外部 fileList 时才更新内部列表
      if (!props.fileList || props.fileList.length === 0) {
        internalFileList.value = files
      }
      emit('update:fileList', files)
    }
  }
})

// 处理上传成功
const handleSuccess = (response: any, file: UploadFile, fileList: UploadFiles) => {
  // 根据responseKey获取URL
  const urlKey = props.responseKey || 'data.url'
  const url = getNestedValue(response, urlKey) || file.url

  if (url) {
    file.url = url
    file.status = 'success'
  }
  loading.close()
  emit('success', response, file, fileList)
  updateModelValue(fileList)
}

// 处理上传错误
const handleError = (error: Error, file: UploadFile, fileList: UploadFiles) => {
  loading.close()
  ElMessage.error(error.message)
  file.status = 'fail'
  emit('error', error, file, fileList)
}

// 处理文件变化
const handleChange = (file: UploadFile, fileList: UploadFiles) => {
  console.log(file.url, fileList, 'handleChange')
  emit('change', file, fileList)
  updateModelValue(fileList)
}

// 处理文件移除
const handleRemove = (file: UploadFile, list?: UploadFiles) => {
  // 获取当前文件列表
  const currentFileList = list || fileList.value

  // 过滤掉要删除的文件
  const updatedFileList = currentFileList.filter((item) => item.uid !== file.uid)

  // 如果外部传入了 fileList，只触发事件，不更新内部列表
  if (props.fileList && props.fileList.length > 0) {
    emit('remove', file, updatedFileList)
    // 外部 fileList 的情况下，不更新 modelValue，由父组件处理
    return
  }

  // 更新内部文件列表
  internalFileList.value = updatedFileList

  // 触发事件
  emit('remove', file, updatedFileList)

  // 直接更新 modelValue，避免通过 updateModelValue 函数
  const urls = updatedFileList.map((item) => item.url || '').filter(Boolean)
  if (isMultiple.value) {
    emit('update:modelValue', urls)
  } else {
    emit('update:modelValue', urls[0] || '')
  }
}

// 处理超出限制
const handleExceed = (files: File[], fileList: UploadFiles) => {
  ElMessage.error(`最多上传${props.limit}张图片`)
  emit('exceed', files, fileList)
}

// 处理上传前
const handleBeforeUpload = (file: UploadFile) => {
  loading = ElLoading.service({
    lock: true,
    text: '上传中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  emit('before-upload', file)
  return true
}

// 处理移除前
const handleBeforeRemove = (file: UploadFile, fileList: UploadFiles) => {
  emit('before-remove', file, fileList)
  return true
}

// 处理上传进度
const handleProgress = (evt: ProgressEvent, file: UploadFile, fileList: UploadFiles) => {
  emit('progress', evt, file, fileList)
}

// 更新modelValue
const updateModelValue = (files: UploadFiles) => {
  if (!files || !files.length) {
    emit('update:modelValue', isMultiple.value ? [] : '')
    return
  }

  const urls = files.map((file) => file.url || '').filter(Boolean)

  if (isMultiple.value) {
    emit('update:modelValue', urls)
  } else {
    emit('update:modelValue', urls[0] || '')
  }
}

// 获取嵌套对象的值
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    // 如果值没有变化，跳过更新
    if (newValue === oldValue) {
      return
    }

    // 如果外部传入了 fileList，不更新内部列表
    if (props.fileList && props.fileList.length > 0) {
      return
    }

    // 使用 nextTick 来避免同步更新导致的循环
    nextTick(() => {
      if (!newValue) {
        internalFileList.value = []
      } else if (Array.isArray(newValue)) {
        // 多文件模式
        internalFileList.value = newValue.map((url, index) => ({
          uid: `file-${index}`,
          name: `file-${index}`,
          url,
          status: 'success'
        }))
      } else if (typeof newValue === 'string') {
        // 单文件模式
        internalFileList.value = [
          {
            uid: 'file-0',
            name: 'file-0',
            url: newValue,
            status: 'success'
          }
        ]
      }
    })
  },
  { immediate: true }
)

// 判断是否显示trigger
const shouldShowTrigger = computed(() => {
  // 如果组件被禁用，不显示trigger
  if (props.disabled) {
    return false
  }

  // 如果是picture-card模式，总是显示trigger
  if (props.listType === 'picture-card') {
    return true
  }

  // 如果是单图模式，当没有文件时显示trigger
  if (!isMultiple.value) {
    return !hasFiles.value
  }

  // 如果是多图模式，当文件数量未达到限制时显示trigger
  return fileList.value.length < props.limit
})
</script>

<style lang="less">
.upload-component {
  .upload-single-mode {
    position: relative;
    width: 178px;
    height: 178px;
    .upload-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 178px;
      height: 178px;
      z-index: 10;
      pointer-events: none;

      .upload-overlay-trigger {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 178px;
        height: 178px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        opacity: 0;
        pointer-events: auto;

        .upload-overlay-icon {
          font-size: 28px;
          color: #fff;
          margin-bottom: 8px;
        }

        .upload-overlay-text {
          font-size: 14px;
          color: #fff;
        }
      }
    }

    &:hover .upload-overlay .upload-overlay-trigger {
      opacity: 1;
    }
  }

  .upload-multiple-mode {
    .upload-preview {
      margin-bottom: 12px;

      .upload-preview-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .upload-preview-item {
        position: relative;
        width: 178px;
        height: 178px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #e4e7ed;

        .upload-preview-image {
          position: relative;
          width: 100%;
          height: 100%;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .upload-preview-actions {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;

            .upload-preview-remove {
              color: #fff;
              font-size: 18px;
              cursor: pointer;
              padding: 8px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.2);

              &:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            }
          }

          &:hover .upload-preview-actions {
            opacity: 1;
          }
        }
      }
    }
  }

  .upload-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 178px;
    height: 178px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
      border-color: #409eff;
    }

    .upload-icon {
      font-size: 28px;
      color: #8c939d;
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 14px;
      color: #8c939d;
    }
  }

  .upload-tip {
    font-size: 12px;
    color: #606266;
    margin-top: 8px;
  }
}

// 覆盖element-plus的样式
:deep(.el-upload--picture-card) {
  width: 178px;
  height: 178px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 178px;
  height: 178px;
}

// 隐藏trigger时的样式
:deep(.upload-hidden) {
  .el-upload__input {
    display: none;
  }

  .el-upload-dragger {
    display: none;
  }
}
</style>
