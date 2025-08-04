# Upload 组件

一个通用的文件上传组件，基于 Element Plus 的 ElUpload 组件封装，支持自定义配置和上传结果处理。

## 特性

- 支持单文件和多文件上传
- 支持自定义文件类型限制
- 支持文件大小限制
- 支持自定义上传前验证
- 支持自定义上传成功/失败回调
- 支持智能错误信息处理（自动解析不同格式的错误信息）
- 支持自定义渲染样式
- 支持拖拽上传
- 支持自动上传控制

## 基本用法

### 单文件上传

```vue
<template>
  <Upload
    v-model="imageUrl"
    action="https://your-api.com/upload"
    accept="image/*"
    :max-size="5"
    @success="handleSuccess"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from '@/components/Upload'

const imageUrl = ref('')

const handleSuccess = (response, file, fileList) => {
  console.log('上传成功:', response)
}
</script>
```

### 多文件上传

```vue
<template>
  <Upload
    v-model="imageUrls"
    action="https://your-api.com/upload"
    :multiple="true"
    accept="image/*"
    :limit="5"
    @success="handleSuccess"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from '@/components/Upload'

const imageUrls = ref([])

const handleSuccess = (response, file, fileList) => {
  console.log('上传成功:', response)
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | string \| string[] | '' |
| action | 上传的地址 | string | '' |
| multiple | 是否支持多选文件 | boolean | false |
| accept | 接受上传的文件类型 | string | '*' |
| showFileList | 是否显示已上传文件列表 | boolean | true |
| maxSize | 文件大小限制，单位MB | number | 5 |
| disabled | 是否禁用 | boolean | false |
| autoUpload | 是否自动上传 | boolean | true |
| drag | 是否启用拖拽上传 | boolean | false |
| listType | 文件列表的类型 | 'text' \| 'picture' \| 'picture-card' | 'text' |
| limit | 最大上传数量 | number | 1 |
| beforeUpload | 上传前的钩子 | function | - |
| onSuccess | 上传成功的回调 | function | - |
| onError | 上传失败的回调 | function | - |
| onExceed | 文件超出个数限制时的回调 | function | - |
| onRemove | 文件列表移除文件时的回调 | function | - |
| customRender | 自定义渲染函数 | function | - |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 绑定值变化时触发 | (value: string \| string[]) |
| success | 上传成功时触发 | (response: any, file: File, fileList: File[]) |
| error | 上传失败时触发 | (error: Error, file: File, fileList: File[]) |
| exceed | 文件超出个数限制时触发 | (files: File[], fileList: File[]) |
| remove | 文件列表移除文件时触发 | (file: File, fileList: File[]) |

## 错误处理

组件会自动处理不同格式的错误信息：

- 如果 `error.message` 是字符串，直接使用该字符串
- 如果 `error.message` 是对象且包含 `data` 属性，使用 `error.message.data`
- 如果无法解析错误信息，使用默认的"上传失败"提示

```vue
<template>
  <Upload
    v-model="imageUrl"
    action="https://your-api.com/upload"
    @error="handleError"
  />
</template>

<script setup>
const handleError = (error, file, fileList) => {
  // 错误已经被组件自动处理并显示
  console.log('上传失败:', error)
}
</script>
```

## 在 Form 组件中使用

```vue
<template>
  <Form :schema="schema" :model="formModel" @register="formRegister" />
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Form } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'

const { required } = useValidator()
const { formRegister } = useForm()

const formModel = ref({})

const schema = reactive([
  {
    field: 'image',
    label: '图片上传',
    component: 'Upload',
    componentProps: {
      action: 'https://your-api.com/upload',
      accept: 'image/*',
      maxSize: 5,
      onSuccess: (res) => {
        formModel.value.image = res.data.url
      }
    },
    formItemProps: {
      rules: [required()]
    }
  }
])
</script>
```

## 自定义渲染

```vue
<template>
  <Upload
    v-model="imageUrl"
    action="https://your-api.com/upload"
    :custom-render="customRender"
  />
</template>

<script setup>
import { h } from 'vue'
import { Upload } from '@/components/Upload'

const imageUrl = ref('')

const customRender = (fileList) => {
  return h('div', { class: 'custom-upload' }, [
    h('button', { class: 'upload-btn' }, '自定义上传按钮')
  ])
}
</script>
``` 