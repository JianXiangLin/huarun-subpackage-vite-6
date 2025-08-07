# Upload 组件

基于 Element Plus Upload 组件的二次封装，支持单图和多图上传，提供更好的用户体验。

## 特性

1. 支持 ElUpload 原有的所有属性和方法
2. 支持上传单图和多图，list-type 同 ElUpload
3. 上传多图时，多图并列展示，超出则换行，间距12px，图片展示178px*178px
4. 支持 v-model 双向绑定
5. 支持自定义响应数据格式
6. 支持自定义上传触发器

## 基础用法

### 单图上传

```vue
<template>
  <Upload
    v-model="imageUrl"
    action="https://example.com/upload"
    :headers="headers"
    accept="image/*"
    :limit="1"
    placeholder="点击上传图片"
    tip="支持 jpg、png 格式，文件大小不超过 2MB"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from '@/components/Upload'

const imageUrl = ref('')
const headers = {
  Authorization: 'Bearer your-token'
}
</script>
```

### 多图上传

```vue
<template>
  <Upload
    v-model="imageList"
    action="https://example.com/upload"
    :headers="headers"
    accept="image/*"
    :limit="5"
    :multiple="true"
    placeholder="点击上传图片"
    tip="最多上传5张图片，每张文件大小不超过 2MB"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from '@/components/Upload'

const imageList = ref([])
const headers = {
  Authorization: 'Bearer your-token'
}
</script>
```

### 在 Form 组件中使用

```vue
<template>
  <Form :schema="schema" :model="formModel" />
</template>

<script setup>
import { ref } from 'vue'
import { Form } from '@/components/Form'

const formModel = ref({
  image: '',
  images: []
})

const schema = [
  {
    field: 'image',
    label: '单图上传',
    component: 'Upload',
    componentProps: {
      action: 'https://example.com/upload',
      accept: 'image/*',
      :limit="1",
      placeholder: '点击上传图片'
    },
    formItemProps: {
      rules: [{ required: true, message: '请上传图片' }]
    }
  },
  {
    field: 'images',
    label: '多图上传',
    component: 'Upload',
    componentProps: {
      action: 'https://example.com/upload',
      accept: 'image/*',
      :limit="5",
      :multiple="true",
      placeholder: '点击上传图片'
    }
  }
]
</script>
```

## Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| modelValue | 绑定值 | string / string[] / UploadFiles | — | — |
| fileList | 文件列表 | UploadFiles | — | [] |
| action | 上传的地址 | string | — | — |
| headers | 设置上传的请求头部 | object | — | {} |
| multiple | 是否支持多选文件 | boolean | — | false |
| data | 上传时附带的额外参数 | object | — | {} |
| name | 上传的文件字段名 | string | — | file |
| withCredentials | 支持发送 cookie 凭证信息 | boolean | — | false |
| showFileList | 是否显示已上传文件列表 | boolean | — | true |
| drag | 是否启用拖拽上传 | boolean | — | false |
| accept | 接受上传的文件类型 | string | — | — |
| onPreview | 点击已上传的文件链接时的钩子 | function | — | — |
| onRemove | 文件列表移除文件时的钩子 | function | — | — |
| onSuccess | 文件上传成功时的钩子 | function | — | — |
| onError | 文件上传失败时的钩子 | function | — | — |
| onProgress | 文件上传时的钩子 | function | — | — |
| onChange | 文件状态改变时的钩子 | function | — | — |
| beforeUpload | 上传文件之前的钩子 | function | — | — |
| beforeRemove | 删除文件之前的钩子 | function | — | — |
| listType | 文件列表的类型 | string | text/picture/picture-card | text |
| autoUpload | 是否在选取文件后立即进行上传 | boolean | — | true |
| fileList | 上传的文件列表 | array | — | [] |
| httpRequest | 覆盖默认的上传行为 | function | — | — |
| disabled | 是否禁用 | boolean | — | false |
| limit | 最大允许上传个数 | number | — | — |
| onExceed | 当超出限制时，所执行的回调函数 | function | — | — |

### 自定义属性

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| valueType | 返回值的类型 | string | string/array/object | string |
| responseKey | 响应数据中文件URL的键名 | string | — | data.url |
| urlKey | 文件对象中URL的键名 | string | — | url |
| showTrigger | 是否显示上传触发器 | boolean | — | true |
| tip | 提示文字 | string | — | — |
| placeholder | 占位符文字 | string | — | 点击上传 |

## Events

| 事件名称 | 说明 | 回调参数 |
|----------|------|----------|
| change | 文件状态改变时的钩子 | (file, fileList) |
| remove | 文件列表移除文件时的钩子 | (file, fileList) |
| success | 文件上传成功时的钩子 | (response, file, fileList) |
| error | 文件上传失败时的钩子 | (error, file, fileList) |
| progress | 文件上传时的钩子 | (evt, file, fileList) |
| exceed | 当超出限制时，所执行的回调函数 | (files, fileList) |
| before-upload | 上传文件之前的钩子 | (file) |
| before-remove | 删除文件之前的钩子 | (file, fileList) |

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|------------|
| trigger | 触发文件选择框的内容 | { fileList } |
| tip | 提示说明文字 | — |

## 样式定制

组件提供了以下 CSS 类名，可以用于样式定制：

- `.upload-component` - 组件根容器
- `.upload-trigger` - 上传触发器
- `.upload-icon` - 上传图标
- `.upload-text` - 上传文字
- `.upload-tip` - 提示文字
- `.upload-preview` - 多图预览区域
- `.upload-preview-list` - 预览列表
- `.upload-preview-item` - 预览项
- `.upload-preview-image` - 预览图片
- `.upload-preview-actions` - 预览操作区域
- `.upload-preview-remove` - 删除按钮 