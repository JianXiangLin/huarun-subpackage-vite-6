<script setup lang="ts">
import { getTableListApi } from '@/api/table'
const getTableList = async (params?: Params) => {
  const res = await getTableListApi(
    params || {
      pageIndex: 1,
      pageSize: 10
    }
  )
    .catch(() => {})
    .finally((res) => {
      console.log('finally', res)
    })
}
getTableList()
</script>
<template>
  <h1>About</h1>
  <router-link to="/saas/home">Go Home</router-link>
</template>
