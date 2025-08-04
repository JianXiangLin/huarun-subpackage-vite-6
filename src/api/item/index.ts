import request from '@/axios'
export const getItemListApi = (params: any) => {
  return request.get({ url: '/api/items', params })
}
