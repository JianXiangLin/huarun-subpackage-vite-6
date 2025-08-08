# Upload 上传组件

基于 Element Plus 的 Upload 组件封装，支持单图和多图上传，自动处理上传地址和认证信息。

## 特性

- 🚀 自动配置上传地址和认证头
- 📸 支持单图和多图上传
- 🎨 自定义上传触发器样式
- 🔄 支持 v-model 双向绑定
- 📝 支持自定义提示信息
- 🛡️ 文件类型和大小限制

## 基础用法

### 单图上传

```vue
<template>
  <Upload v-model="imageUrl" :limit="1" />
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from '@/components/Upload'

const imageUrl = ref('')
</script>
```

### 多图上传

```vue
<template>
  <Upload v-model="imageList" :limit="5" multiple />
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from '@/components/Upload'

const imageList = ref([])
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `string \| string[] \| UploadFiles` | - |
| fileList | 文件列表 | `UploadFiles` | `[]` |
| multiple | 是否支持多选文件 | `boolean` | `false` |
| limit | 最大允许上传个数 | `number` | `1` |
| accept | 接受上传的文件类型 | `string` | `'image/*'` |
| uploadUrl | 上传地址，默认使用API基础地址 + /upload | `string` | - |
| uploadHeaders | 上传请求头，默认包含Authorization | `Record<string, string>` | - |
| tip | 提示文字 | `string` | - |
| placeholder | 占位符文字 | `string` | `'点击上传'` |
| disabled | 是否禁用 | `boolean` | `false` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 文件状态改变时的钩子 | `(file: UploadFile, fileList: UploadFiles)` |
| success | 文件上传成功时的钩子 | `(response: any, file: UploadFile, fileList: UploadFiles)` |
| error | 文件上传失败时的钩子 | `(error: Error, file: UploadFile, fileList: UploadFiles)` |
| remove | 文件列表移除文件时的钩子 | `(file: UploadFile, fileList: UploadFiles)` |
| exceed | 文件超出个数限制时的钩子 | `(files: File[], fileList: UploadFiles)` |

### Slots

| 插槽名 | 说明 | 参数 |
|--------|------|------|
| trigger | 触发文件选择框的内容 | `{ fileList }` |
| tip | 提示说明文字 | - |

## 默认配置

### 上传地址

组件会自动配置上传地址：

1. 如果传入 `uploadUrl`，优先使用传入的地址
2. 否则使用环境变量 `VITE_API_BASE_PATH` + `/upload`

### 请求头

组件会自动配置请求头：

1. 设置 `Content-Type: multipart/form-data`
2. 自动添加 `Authorization: Bearer {token}` 认证头
3. 如果传入 `uploadHeaders`，会合并到默认头中

## 高级用法

### 自定义上传地址

```vue
<template>
  <Upload 
    v-model="imageUrl" 
    upload-url="/api/custom/upload"
  />
</template>
```

### 自定义请求头

```vue
<template>
  <Upload 
    v-model="imageUrl" 
    :upload-headers="{
      'X-Custom-Header': 'custom-value',
      'Authorization': 'Bearer custom-token'
    }"
  />
</template>
```

### 自定义触发器

```vue
<template>
  <Upload v-model="imageUrl">
    <template #trigger="{ fileList }">
      <div class="custom-trigger">
        <el-icon><Plus /></el-icon>
        <span>自定义上传按钮</span>
      </div>
    </template>
  </Upload>
</template>
```

### 自定义提示

```vue
<template>
  <Upload 
    v-model="imageUrl" 
    tip="支持 jpg、png 格式，文件大小不超过 2MB"
  />
</template>
```

## 注意事项

1. 组件会自动从用户store中获取token进行认证
2. 上传地址默认使用环境变量配置的API基础地址
3. 支持通过props覆盖默认的上传地址和请求头
4. 文件上传成功后会返回文件URL，支持自定义响应数据中URL的键名 