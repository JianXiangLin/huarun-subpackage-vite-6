<script setup lang="ts">
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive, watch, h, computed, nextTick } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { useValidator } from '@/hooks/web/useValidator'
import { getDictOneApi } from '@/api/common'
import { useForm } from '@/hooks/web/useForm'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import { VenueData } from '@/api/venue/types'
import { getItemListApi } from '@/api/item'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { ElIcon } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const { required } = useValidator()

const { t } = useI18n()

// 定义props
interface Props {
  modelValue?: boolean
  formData?: Partial<VenueData>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  formData: () => ({})
})

// 定义emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = ref(false)

const dialogVisible2 = ref(false)

const dialogVisible3 = ref(false)

const dialogVisible4 = ref(false)

// 监听props变化，同步到本地状态
watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible2.value = newVal
  }
)

// 监听本地状态变化，同步到父组件
watch(dialogVisible2, (newVal) => {
  emit('update:modelValue', newVal)
})

const { formRegister, formMethods } = useForm()
const { getElFormExpose } = formMethods

// 表单数据
const formModel = ref<Partial<VenueData>>({})

// 监听 isShowNum 的变化，当关闭时清空统计维度
watch(
  () => formModel.value.isShowNum,
  (newVal) => {
    console.log('isShowNum changed:', newVal)
    if (!newVal) {
      nextTick(() => {
        formModel.value.showNumType = undefined
      })
    }
    console.log(formModel.value, 'formModel.value')
  },
  { deep: true, immediate: true }
)

// 添加一个更可靠的监听方法，监听整个 formModel 的变化
watch(
  formModel,
  (newVal) => {
    console.log('formModel changed:', newVal)
    if (newVal.isShowNum === false) {
      nextTick(() => {
        formModel.value.showNumType = undefined
      })
    }
  },
  { deep: true }
)

// 监听formData变化，初始化表单数据
watch(
  () => props.formData,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      formModel.value = { ...newVal }
      console.log('formData changed, image value:', formModel.value.image)
      console.log('formData changed, full formModel:', formModel.value)
    } else {
      formModel.value = {}
    }
  },
  { immediate: true, deep: true }
)
const itemList = ref<ItemData[]>([])
const baseSchema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: t('common.name'),
    component: 'Input',
    formItemProps: {
      rules: [required()]
    },
    tips: '请输入场馆的完整名称，建议使用中文名称'
  },
  {
    field: 'tel',
    label: t('venue.phone'),
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'businessHours',
    label: t('venue.businessHours'),
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'sortNum',
    label: t('common.sort'),
    component: 'InputNumber',
    formItemProps: {
      rules: [required()]
    },
    componentProps: {
      style: {
        textAlign: 'left'
      }
    }
  },
  {
    field: 'items',
    label: '场馆项目',
    component: 'CheckboxGroup',
    componentProps: {
      options: itemList
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'address.name',
    label: t('venue.address'),
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'info',
    label: '场馆详情',
    component: 'Editor',
    componentProps: {
      height: 300
    },
    formItemProps: {
      rules: [
        {
          required: true,
          validator: (rule: any, value: any, callback: any) => {
            // 检查值是否为空或只包含空白字符
            if (!value || value.trim() === '' || value === '<p><br></p>' || value === '<p></p>') {
              callback(new Error('请输入场馆详情'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }
  },
  {
    field: 'image',
    component: 'Upload',
    label: '场馆主图',
    componentProps: {
      action: 'https://test.hlsports.net/api/upload/pic',
      showFileList: false,
      accept: 'image/*',
      maxSize: 0.5,
      placeholder: '点击上传场馆主图',
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjFjYzhlOGMyN2JmNjllNTdkYjViNDMiLCJpYXQiOjE3NTQ1NDEzNDAsImV4cCI6MTc1NDU5ODk0MH0.cIf6oh2wU7jEuZNGYXsdrqIXg82JEfWsSfVg11ii_v0'
      },
      limit: 1,
      fileList: formModel.value.image
        ? [{ name: formModel.value.image, url: formModel.value.image }]
        : [],
      onSuccess: (_response, uploadFile) => {
        formModel.value.image = _response.data.url
      },
      slots: {
        default: () =>
          h('div', { class: 'avatar-uploader' }, [
            formModel.value.image
              ? h('img', {
                  src: formModel.value.image,
                  class: 'avatar'
                })
              : null,
            !formModel.value.image
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
    },
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'venueBus',
    label: t('common.bussiness'),
    component: 'Input'
  },
  {
    field: 'isUsed',
    label: t('common.status'),
    component: 'RadioGroup',
    componentProps: {
      options: [
        {
          label: t('venue.status.enable'),
          value: 1
        },
        {
          label: t('venue.status.disable'),
          value: 0
        }
      ]
    }
  },
  {
    field: 'otherSetting',
    label: '其他设置',
    component: 'Divider'
  },
  {
    field: 'showInMiniProgram',
    label: '小程序展示开关',
    component: 'Switch',
    componentProps: {
      activeText: '开',
      inactiveText: '关',
      inlinePrompt: true
    },
    tips: '开启后此场馆将展示在小程序'
  },
  {
    field: 'isShowNum',
    label: '展示馆内人数',
    component: 'Switch',
    componentProps: {
      activeText: '开',
      inactiveText: '关',
      inlinePrompt: true,
      on: {
        change: (val: boolean) => {
          console.log('Switch change event:', val)
          // 使用 nextTick 确保在下一个 tick 中更新
          nextTick(() => {
            formModel.value.isShowNum = val
            if (!val) {
              formModel.value.showNumType = undefined
            }
          })
        }
      }
    }
  }
])

// 统计维度字段配置
const showNumTypeField: FormSchema = {
  field: 'showNumType',
  label: '统计维度',
  component: 'RadioGroup',
  componentProps: {
    options: [
      { label: '按手环', value: 'voucher' },
      { label: '按闸机组', value: 'accgroup' },
      { label: '按客流监控', value: 'camera' }
    ]
  },
  formItemProps: {
    rules: [required()]
  }
}

// 动态生成 schema，根据 isShowNum 的值来决定是否显示统计维度
const schema = computed(() => {
  const schemas = [...baseSchema]

  // 如果 isShowNum 为 true，添加统计维度字段
  console.log(formModel.value.isShowNum, 'formModel.value.isShowNum')
  if (formModel.value.isShowNum) {
    schemas.push(showNumTypeField)
  }

  return schemas
})
const formSubmit = async () => {
  const elFormExpose = await getElFormExpose()
  console.log('formSubmit - image value:', formModel.value.image)

  if (!elFormExpose) {
    console.error('Form expose not found')
    return
  }

  elFormExpose.validate((valid) => {
    console.log('formSubmit - validation result:', valid)
    if (valid) {
      console.log('submit success', formModel.value)
      // 提交成功后关闭弹框
      dialogVisible2.value = false
      // 重置表单数据
      formModel.value = {}
    } else {
      console.log('submit fail - validation failed')
      // 显示具体的验证错误信息
      const formItems = elFormExpose.fields
      if (formItems) {
        formItems.forEach((field: any) => {
          if (field.validateState === 'error') {
            console.log('Validation error for field:', field.prop, field.validateMessage)
          }
        })
      }
    }
  })
}

const getItemList = () => {
  getItemListApi({
    itemsPerPage: 9999
  }).then((res) => {
    const list = res.data.items
    itemList.value = list.map((item) => ({
      label: item.name,
      value: item._id
    }))
  })
}
getItemList()
</script>

<template>
  <div>
    <Dialog
      v-model="dialogVisible2"
      :title="t('venue.create')"
      :fullscreen="false"
      :defaultFullscreen="true"
    >
      <Form :schema="schema" :model="formModel" :isCol="false" @register="formRegister" />
      <template #footer>
        <BaseButton type="primary" @click="formSubmit">{{ t('dialogDemo.submit') }}</BaseButton>
        <BaseButton @click="dialogVisible2 = false">{{ t('dialogDemo.close') }}</BaseButton>
      </template>
    </Dialog>
  </div>
</template>
<style lang="less" scoped>
:deep(.avatar),
:deep(.avatar-uploader) {
  width: 178px;
  height: 178px;
  object-fit: cover;
  border: 1px dashed #dcdfe6;
}
:deep(.el-icon.avatar-uploader-icon) {
  width: 178px;
  height: 178px;
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}
/* 样式已移至Upload组件中 */
</style>
