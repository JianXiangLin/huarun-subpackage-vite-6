<script setup lang="tsx">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { getVenueListApi } from '@/api/venue'
import { VenueData } from '@/api/venue/types'
import { ref, h } from 'vue'
import { ElTag } from 'element-plus'
import { BaseButton } from '@/components/Button'
import VenueForm from './VenueForm.vue'
import { cloneDeep } from 'lodash-es'
interface Params {
  pageIndex?: number
  pageSize?: number
}

const { t } = useI18n()

// 控制VenueForm弹框显示
const venueFormVisible = ref(false)
// 表单数据
const formData = ref<Partial<VenueData>>({})

const columns: TableColumn[] = [
  {
    field: 'name',
    label: t('common.name')
  },
  {
    field: 'isUsed',
    label: t('common.status'),
    formatter: (_: Recordable, __: TableColumn, cellValue: boolean) => {
      return (
        <ElTag type={cellValue ? 'success' : 'danger'}>
          {cellValue ? t('venue.status.enable') : t('venue.status.disable')}
        </ElTag>
      )
    }
  },
  {
    field: 'venueNo',
    label: t('common.code')
  },
  {
    field: 'venueBus',
    label: t('common.bussiness'),
    slots: {
      default: (data) => {
        return <div>{data.venueBus}</div>
      }
    }
  },
  {
    field: 'projectNameArr',
    label: t('common.project'),
    slots: {
      default: (data) => {
        return <div class="ellipsis">{data.row.projectNameArr?.join('、')}</div>
      }
    },
    ellipsis: true
  },
  {
    field: 'sortNum',
    label: t('common.sort'),
    sortable: true
  },
  {
    field: 'action',
    label: t('tableDemo.action'),
    slots: {
      default: (data) => {
        return (
          <BaseButton type="primary" onClick={() => actionFn(data)}>
            {t('common.edit')}
          </BaseButton>
        )
      }
    }
  }
]

const loading = ref(true)

const tableDataList = ref<VenueData[]>([])

const getTableList = (params?: Params) => {
  getVenueListApi(
    params || {
      pageIndex: 1,
      pageSize: 10
    }
  )
    .then((res) => {
      tableDataList.value = res.data.venues
    })
    .finally(() => {
      loading.value = false
    })
}

getTableList()

const actionFn = (data: any) => {
  const dataRow = cloneDeep(data.row)
  // 设置表单数据
  dataRow.items = dataRow.items.filter((item: any) => item.isUsed).map((item: any) => item._id)
  formData.value = dataRow
  venueFormVisible.value = true
  console.log(formData.value, 'formData.value')
}

// 打开新建弹框
const openCreateDialog = () => {
  // 清空表单数据
  formData.value = {}
  venueFormVisible.value = true
}
</script>

<template>
  <ContentWrap :title="t('venue.title')" :message="t('venue.description')">
    <div class="mb-12px">
      <BaseButton type="primary" @click="openCreateDialog">
        {{ t('common.create') }}
      </BaseButton>
    </div>
    <Table
      :pagination="{
        pageSize: 10,
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper'
      }"
      :columns="columns"
      :data="tableDataList"
      :loading="loading"
      :defaultSort="{ prop: 'sortNum', order: 'descending' }"
    />
    <VenueForm v-model="venueFormVisible" :form-data="formData" />
  </ContentWrap>
</template>
