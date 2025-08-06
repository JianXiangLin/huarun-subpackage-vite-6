<script setup lang="ts">
import { ref, computed, h, watch, nextTick } from 'vue'
import { ElUpload, ElIcon, ElMessage, ElButton, ElLoading, ElDialog } from 'element-plus'
import { Plus, Delete, View } from '@element-plus/icons-vue'
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
      : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjJhY2RjMWQyODdiNTFiMWUwYjlhYTMiLCJpYXQiOjE3NTQ0NDIyNjEsImV4cCI6MTc1NDQ5OTg2MX0.CTSB5AE3P-ErQyNq2SlZgc6vTsUDGjpRGxAM0vGADm0'
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

// 图片预览相关状态
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')
// 上传loading
const loading = ref<any>(null)

// 内部管理的图片数据
const internalValue = ref<any>(props.multiple ? [] : '')

// 监听 fileList 变化，同步到内部状态
watch(
  () => fileList.value,
  (newFileList) => {
    console.log('fileList changed:', newFileList)
    if (newFileList && newFileList.length > 0) {
      // 从 fileList 中提取 URL
      const urls = newFileList
        .map((file: any) => file.url || file.response?.data?.url)
        .filter(Boolean)
      if (props.multiple) {
        internalValue.value = urls
      } else {
        internalValue.value = urls[0] || ''
      }
    }
  },
  { deep: true }
)

// 计算属性：同步外部传入的值
const currentValue = computed({
  get: () => {
    return internalValue.value
  },
  set: (value) => {
    internalValue.value = value
    emit('update:modelValue', value)
  }
})

// 监听 modelValue 变化，同步到内部状态
watch(
  () => props.modelValue,
  (newVal) => {
    console.log('图片地址:', newVal)
    if (props.multiple) {
      internalValue.value = Array.isArray(newVal) ? newVal : []
    } else {
      internalValue.value = newVal || ''
    }

    // 如果有默认值，初始化 fileList
    if (newVal) {
      if (props.multiple) {
        const urls = Array.isArray(newVal) ? newVal : []
        fileList.value = urls.map((url: string) => ({
          name: url.split('/').pop() || 'image',
          url: url
        }))
      } else {
        fileList.value = [
          {
            name: newVal.split('/').pop() || 'image',
            url: newVal
          }
        ]
      }
    } else {
      // 同步清空 ElUpload 的文件列表，确保状态一致
      fileList.value = []
    }
    console.log('Upload component internalValue:', internalValue.value)
    console.log('Upload component fileList:', fileList.value)
  },
  { immediate: true }
)

// 获取当前图片数量
const getCurrentImageCount = () => {
  if (props.multiple) {
    return Array.isArray(internalValue.value) ? internalValue.value.length : 0
  } else {
    return internalValue.value ? 1 : 0
  }
}

// 检查是否还可以上传更多图片
const canUploadMore = () => {
  const currentCount = getCurrentImageCount()
  return currentCount < props.limit
}

// 预览图片
const handlePreview = (url: string) => {
  previewImage.value = url
  previewTitle.value = '图片预览'
  previewVisible.value = true
}

// 关闭预览
const handlePreviewClose = () => {
  previewVisible.value = false
  previewImage.value = ''
  previewTitle.value = ''
}

// 删除图片
const handleDelete = (index?: number) => {
  if (props.multiple) {
    // 多文件模式
    const urls = Array.isArray(internalValue.value) ? [...internalValue.value] : []
    if (index !== undefined && index >= 0 && index < urls.length) {
      urls.splice(index, 1)
      currentValue.value = urls
    }
  } else {
    // 单文件模式
    currentValue.value = ''
  }

  // 清空 ElUpload 的文件列表，避免触发 on-exceed
  fileList.value = []

  ElMessage.success('删除成功')
}

// 上传成功回调
const handleSuccess = (response: any, file: File, fileList: File[]) => {
  console.log('Upload success:', response, response.data)

  // 默认处理：假设响应格式为 { data: { url: string } }
  if (response && response.data && response.data.url) {
    if (props.multiple) {
      const urls = Array.isArray(internalValue.value) ? [...internalValue.value] : []
      urls.push(response.data.url)
      currentValue.value = urls
    } else {
      currentValue.value = response.data.url
    }
  }
  // 关闭loading
  if (loading.value) {
    loading.value.close()
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
  // 关闭loading
  if (loading.value) {
    loading.value.close()
  }
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

  // 检查上传数量限制 - 使用我们自己的图片数量检查
  const currentCount = getCurrentImageCount()
  if (currentCount >= props.limit) {
    ElMessage.warning(`最多上传${props.limit}个文件`)
    return false
  }

  // 显示loading
  loading.value = ElLoading.service({
    lock: true,
    text: '上传中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  // 调用自定义验证
  if (props.beforeUpload) {
    return props.beforeUpload(file)
  }

  return true
}

// 超出限制回调
const handleExceed = (files: File[], fileList: File[]) => {
  // 使用我们自己的图片数量检查，避免 ElUpload 内部状态不一致的问题
  const currentCount = getCurrentImageCount()
  if (currentCount >= props.limit) {
    ElMessage.warning(`最多上传${props.limit}个文件`)

    if (props.onExceed) {
      props.onExceed(files, fileList)
    }

    emit('exceed', files, fileList)
  }
}

// 移除文件回调
const handleRemove = (file: File, fileList: File[]) => {
  // 从内部状态中移除对应的图片
  if (props.multiple) {
    const urls = Array.isArray(internalValue.value) ? [...internalValue.value] : []
    // 这里需要根据文件名或其他标识来匹配要删除的图片
    // 由于 ElUpload 的 fileList 和我们的图片 URL 可能不完全对应
    // 我们暂时不清除内部状态，让用户通过删除按钮来管理
  } else {
    // 单文件模式，清除当前图片
    currentValue.value = ''
  }

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
    const imageUrls = props.multiple
      ? Array.isArray(internalValue.value)
        ? internalValue.value
        : []
      : internalValue.value
        ? [internalValue.value]
        : []

    console.log('Upload component rendering, imageUrls:', imageUrls)
    console.log('Upload component internalValue:', internalValue.value)

    return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } }, [
      // 渲染已上传的图片
      ...imageUrls
        .filter((url) => url)
        .map((url, index) =>
          h(
            'div',
            {
              key: index,
              style: {
                position: 'relative',
                width: '178px',
                height: '178px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                overflow: 'hidden'
              }
            },
            [
              h('img', {
                src: url,
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer'
                },
                onClick: () => handlePreview(url)
              }),
              // 操作按钮
              h(
                'div',
                {
                  style: {
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '4px'
                  }
                },
                [
                  h(
                    ElButton,
                    {
                      size: 'small',
                      type: 'primary',
                      circle: true,
                      onClick: (e: Event) => {
                        e.stopPropagation()
                        handlePreview(url)
                      }
                    },
                    {
                      default: () => h(ElIcon, { size: '12px' }, { default: () => h(View) })
                    }
                  ),
                  h(
                    ElButton,
                    {
                      size: 'small',
                      type: 'danger',
                      circle: true,
                      onClick: (e: Event) => {
                        e.stopPropagation()
                        handleDelete(props.multiple ? index : undefined)
                      }
                    },
                    {
                      default: () => h(ElIcon, { size: '12px' }, { default: () => h(Delete) })
                    }
                  )
                ]
              )
            ]
          )
        ),
      // 上传按钮 - 只有在可以上传更多图片时显示
      canUploadMore()
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
  <div>
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

    <!-- 图片预览对话框 -->
    <ElDialog :show-header="false" v-model="previewVisible" :before-close="handlePreviewClose">
      <div style="text-align: center">
        <img
          :src="previewImage"
          style="max-width: 100%; max-height: 70vh; object-fit: contain"
          alt="预览图片"
        />
      </div>
    </ElDialog>
  </div>
</template>
