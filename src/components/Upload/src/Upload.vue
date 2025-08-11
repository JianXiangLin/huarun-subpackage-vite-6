<template>
  <el-upload
    v-bind="allProps"
    v-on="listeners"
    :limit="limit"
    :headers="mergedHeaders"
    :action="mergedAction"
    :method="mergedMethod"
    :file-list="internalFileList"
    @remove="handleRemove"
    @preview="handlePreview"
    @success="handleSuccess"
    :show-file-list="showFileList"
    list-type="picture-card"
    :class="{ 'hide-upload-btn': !showUploadBtn, 'upload-container': true }"
  >
    <template #trigger v-if="showUploadBtn">
      <div class="upload-trigger">
        <el-icon class="upload-icon" :style="{ fontSize: iconSize + 'px' }">
          <component :is="uploadIcon" />
        </el-icon>
        <div class="upload-text">{{ uploadText }}</div>
      </div>
    </template>
  </el-upload>

  <el-dialog v-model:visible="previewVisible" width="60%" :before-close="handlePreviewClose" center>
    <img :src="previewImage" style="width: 100%" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRefs } from 'vue'
import { ElUpload, ElIcon, ElDialog, ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { UploadFile, UploadProps } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const props = defineProps<{
  headers?: Record<string, string>
  action?: string
  method?: string
  uploadIcon?: any
  uploadText?: string
  previewWidth?: number
  previewHeight?: number
  fileList?: UploadFile[]
  showFileList?: boolean
  disabled?: boolean
  iconSize?: number
  limit?: number
}>()

const emit = defineEmits(['update:fileList', 'remove', 'success', 'error', 'change', 'preview'])

const userStore = useUserStore()

// 默认值处理
const mergedHeaders = computed(() => ({
  authorization: userStore.getToken
    ? `Bearer ${userStore.getToken}`
    : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGYzMzI4OGQzZTM4Mjg3NGU1ZGEzYmQiLCJpYXQiOjE3NTQ4OTAxNzcsImV4cCI6MTc1NDk0Nzc3N30.yyJ_IBsYVeZWMmWSVDBq-m-JCpMJ2fQ-rCGstGT4Ocs',
  ...(props.headers || {})
}))
// 获取默认上传地址
const getDefaultUploadUrl = () => {
  // 如果传入了uploadUrl，优先使用
  if (props.action) {
    return props.action
  }

  // 否则使用API基础地址 + 默认上传路径
  const baseUrl = import.meta.env.VITE_API_BASE_PATH || ''
  return `${baseUrl}/api/upload/pic`
}
// 上传按钮显隐
const showUploadBtn = computed(() => {
  return (
    !disabled.value && (!limit.value || (props.fileList && props.fileList.length < limit.value))
  )
})
// const showUploadBtn = computed(() => {
//   return false
// })
const mergedAction = computed(() => props.action || getDefaultUploadUrl())
const mergedMethod = computed(() => props.method || 'post')

// icon和文字默认
const uploadIcon = computed(() => props.uploadIcon || Plus)
const uploadText = computed(() => props.uploadText || '点击上传')
const iconSize = computed(() => props.iconSize || 28)
const limit = computed(() => props.limit || 1)

// 是否显示文件列表，默认true
const showFileList = computed(() => (props.showFileList === undefined ? true : props.showFileList))

const disabled = computed(() => !!props.disabled)

// 内部维护文件列表，用于和file-list双向绑定
const internalFileList = ref<UploadFile[]>([])

watch(
  () => props.fileList,
  (newList) => {
    if (newList && Array.isArray(newList)) {
      // 保证文件列表每项有 uid，name，url，status
      internalFileList.value = newList.map((file, index) => ({
        uid: file.uid || index,
        name: file.name || `file-${index}`,
        url: file.url || '',
        status: file.status || 'success',
        raw: file.raw || undefined
      }))
    }
  },
  { immediate: true }
)

// 转发除 headers, action, method, fileList 之外所有属性给 el-upload
const {
  headers,
  action,
  method,
  fileList,
  showFileList: sfl,
  uploadIcon: ui,
  uploadText: ut,
  previewWidth,
  previewHeight,
  disabled: dis,
  iconSize: is,
  limit: l,
  ...restAttrs
} = toRefs(props)

// 监听事件转发
const listeners = {}
// 自动绑定所有 $attrs 事件
// 这里简化，用 $attrs 传递监听器
import { useAttrs } from 'vue'
const $attrs = useAttrs()
Object.keys($attrs).forEach((key) => {
  if (key.startsWith('on')) {
    // @ts-ignore
    listeners[key] = $attrs[key]
  }
})

// 上传组件属性，除了我们处理的覆盖属性，其他全部透传
const uploadProps = computed(() => ({
  ...restAttrs,
  disabled: disabled.value,
  // 自动开启列表显示方式为 picture-card，方便预览
  listType: 'picture-card',
  multiple: true,
  // 其余默认都由外部控制
  headers: mergedHeaders.value,
  action: mergedAction.value,
  method: mergedMethod.value,
  fileList: internalFileList.value
}))

// 合并所有属性，包括 $attrs 中的属性
const allProps = computed(() => ({
  ...uploadProps.value,
  ...$attrs
}))

// 大图预览
const previewVisible = ref(false)
const previewImage = ref('')

function handlePreview(file: UploadFile) {
  if (!file.url) {
    ElMessage.warning('图片无预览地址')
    return
  }
  previewImage.value = file.url
  previewVisible.value = true
  emit('preview', file)
}

function handlePreviewClose() {
  previewVisible.value = false
  previewImage.value = ''
}

function handleRemove(file: UploadFile, fileList: UploadFile[]) {
  // 更新内部文件列表
  internalFileList.value = fileList
  emit('remove', file, fileList)
  emit('update:fileList', fileList)
}

function handleSuccess(response: any, file: UploadFile, fileList: UploadFile[]) {
  console.log(response, file, fileList, 'handleSuccess')
}
</script>

<style>
.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 178px;
  height: 178px !important;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-trigger:hover {
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

/* 调整列表图片宽高，使用深度选择器 */
.upload-container .el-upload-list__item .el-upload-list__item-thumbnail {
  width: 178px !important;
  height: 178px !important;
  object-fit: fill;
}
.hide-upload-btn .el-upload {
  display: none !important;
}
</style>
