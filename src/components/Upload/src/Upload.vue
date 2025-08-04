<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { ElUpload, ElIcon, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 定义props
interface Props {
  modelValue?: string | string[]
  action?: string
  multiple?: boolean
  accept?: string
  showFileList?: boolean
  maxSize?: number // 文件大小限制，单位MB
  disabled?: boolean
  autoUpload?: boolean
  drag?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  limit?: number // 最大上传数量
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  onSuccess?: (response: any, file: File, fileList: File[]) => void
  onError?: (error: Error, file: File, fileList: File[]) => void
  onExceed?: (files: File[], fileList: File[]) => void
  onRemove?: (file: File, fileList: File[]) => void
  customRender?: (fileList: any[]) => any
  headers?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  action: '',
  multiple: false,
  accept: '*',
  showFileList: true,
  maxSize: 5,
  disabled: false,
  autoUpload: true,
  drag: false,
  listType: 'text',
  limit: 1,
  beforeUpload: undefined,
  onSuccess: undefined,
  onError: undefined,
  onExceed: undefined,
  onRemove: undefined,
  customRender: undefined,
  headers: () => ({
    Authorization: localStorage.getItem('token')
      ? 'Bearer ' + localStorage.getItem('token')
      : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjFjYzhlOGMyN2JmNjllNTdkYjViNDMiLCJpYXQiOjE3NTQyNzMwMzksImV4cCI6MTc1NDMzMDYzOX0.UFEZaQNBc3gjStasHRLBIC7w7wl059G9Xus2_x9eDOw'
  })
})

// 定义emits
const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  success: [response: any, file: File, fileList: File[]]
  error: [error: Error, file: File, fileList: File[]]
  exceed: [files: File[], fileList: File[]]
  remove: [file: File, fileList: File[]]
}>()

// 文件列表
const fileList = ref<any[]>([])

// 计算属性：根据multiple决定value的类型
// const currentValue = computed({
//   get: () => {
//     if (props.multiple) {
//       return Array.isArray(props.modelValue) ? props.modelValue : []
//     } else {
//       return Array.isArray(props.modelValue) ? props.modelValue[0] || '' : props.modelValue
//     }
//   },
//   set: (value) => {
//     emit('update:modelValue', value)
//   }
// })
const currentValue = ref<any>('')

// 上传成功回调
const handleSuccess = (response: any, file: File, fileList: File[]) => {
  console.log('Upload success:', response, response.data)

  // 默认处理：假设响应格式为 { data: { url: string } }
  if (response && response.data && response.data.url) {
    if (props.multiple) {
      const urls = Array.isArray(currentValue.value) ? currentValue.value : []
      urls.push(response.data.url)
      currentValue.value = urls
    } else {
      currentValue.value = response.data.url
      console.log(response.data.url)
      console.log(currentValue.value)
    }
  }
  ElMessage.success('上传成功')
  // 调用自定义成功回调
  if (props.onSuccess) {
    props.onSuccess(response, file, fileList)
  }

  emit('success', response, file, fileList)
}

// 上传失败回调
const handleError = (error: Error, file: File, fileList: File[]) => {
  console.error('Upload error:', error)

  // 处理错误信息
  let errorMessage = '上传失败'
  if (error.message) {
    if (typeof error.message === 'string') {
      try {
        errorMessage = JSON.parse(error.message).data
      } catch (e) {
        errorMessage = error.message
      }
    } else {
      errorMessage = error.message.data
    }
  }

  ElMessage.error(errorMessage)

  // 调用自定义错误回调
  if (props.onError) {
    props.onError(error, file, fileList)
  }

  emit('error', error, file, fileList)
}

// 上传前验证
const handleBeforeUpload = (file: File) => {
  // 文件大小检查
  if (props.maxSize && file.size / 1024 / 1024 > props.maxSize) {
    ElMessage.error(`文件大小不能超过${props.maxSize}MB!`)
    return false
  }

  // 调用自定义验证
  if (props.beforeUpload) {
    return props.beforeUpload(file)
  }

  return true
}

// 超出限制回调
const handleExceed = (files: File[], fileList: File[]) => {
  ElMessage.warning(`最多上传${props.limit}个文件`)

  if (props.onExceed) {
    props.onExceed(files, fileList)
  }

  emit('exceed', files, fileList)
}

// 移除文件回调
const handleRemove = (file: File, fileList: File[]) => {
  if (props.onRemove) {
    props.onRemove(file, fileList)
  }

  emit('remove', file, fileList)
}

// 自定义渲染插槽
const renderDefaultSlot = () => {
  if (props.customRender) {
    return props.customRender(fileList.value)
  }

  // 默认渲染：图片上传样式
  if (props.listType === 'picture-card' || props.accept.includes('image')) {
    return h('div', [
      currentValue.value &&
      (Array.isArray(currentValue.value) ? currentValue.value.length > 0 : currentValue.value)
        ? h('img', {
            src: Array.isArray(currentValue.value) ? currentValue.value[0] : currentValue.value,
            style: {
              width: '178px',
              height: '178px',
              objectFit: 'cover',
              borderRadius: '6px'
            }
          })
        : null,
      !currentValue.value || (Array.isArray(currentValue.value) && currentValue.value.length === 0)
        ? h(
            'div',
            {
              style: {
                width: '178px',
                height: '178px',
                fontSize: '28px',
                color: '#8c939d',
                textAlign: 'center',
                border: '1px dashed #d9d9d9',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer'
              }
            },
            [
              h(ElIcon, { size: '32px' }, { default: () => h(Plus) }),
              h(
                'div',
                {
                  style: {
                    marginTop: '8px',
                    fontSize: '14px',
                    color: '#8c939d'
                  }
                },
                '点击上传'
              )
            ]
          )
        : null
    ])
  }

  return null
}
</script>

<template>
  <ElUpload
    :action="action"
    :multiple="multiple"
    :accept="accept"
    :show-file-list="showFileList"
    :disabled="disabled"
    :auto-upload="autoUpload"
    :drag="drag"
    :list-type="listType"
    :limit="limit"
    :before-upload="handleBeforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-exceed="handleExceed"
    :on-remove="handleRemove"
    v-model:file-list="fileList"
    :headers="headers"
  >
    <slot>
      <component :is="renderDefaultSlot" />
    </slot>
  </ElUpload>
</template>
