<script setup lang="ts">
import { Dialog } from '@/components/Dialog'
import { useI18n } from '@/hooks/web/useI18n'
import { ref, reactive, watch, h } from 'vue'
import { Form, FormSchema } from '@/components/Form'
import { useValidator } from '@/hooks/web/useValidator'
import { getDictOneApi } from '@/api/common'
import { useForm } from '@/hooks/web/useForm'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import { VenueData } from '@/api/venue/types'
import { getItemListApi } from '@/api/item'
import { ElMessage } from 'element-plus'

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

// 监听formData变化，初始化表单数据
watch(
  () => props.formData,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      formModel.value = { ...newVal }
    } else {
      formModel.value = {}
    }
  },
  { immediate: true, deep: true }
)
const itemList = ref<ItemData[]>([])
const schema = reactive<FormSchema[]>([
  {
    field: 'name',
    label: t('common.name'),
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
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
    component: 'Input',
    formItemProps: {
      rules: [required()]
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
    field: 'address',
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
      rules: [required()]
    }
  },
  {
    field: 'image',
    label: '小程序图片上传',
    component: 'Upload',
    componentProps: {
      action: 'https://test.hlsports.net/api/upload/pic',
      multiple: false,
      accept: 'image/*',
      showFileList: false,
      maxSize: 5,
      onSuccess: (res: any) => {
        console.log(res)
        formModel.value.image = res.data.url
      },
      beforeUpload: (rawFile: File) => {
        console.log(rawFile)
        if (rawFile.size / 1024 / 1024 > 5) {
          ElMessage.error('图片大小不能超过5MB!')
          return false
        }
        return true
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
    field: 'sortNum',
    label: t('common.sort'),
    component: 'InputNumber',
    componentProps: {
      min: 0
    }
  }
])

const formSubmit = async () => {
  const elFormExpose = await getElFormExpose()
  elFormExpose?.validate((valid) => {
    if (valid) {
      console.log('submit success', formModel.value)
      // 提交成功后关闭弹框
      dialogVisible2.value = false
      // 重置表单数据
      formModel.value = {}
    } else {
      console.log('submit fail')
    }
  })
}

const getItemList = () => {
  getItemListApi({}).then((res) => {
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
<style lang="less">
/* 样式已移至Upload组件中 */
</style>
