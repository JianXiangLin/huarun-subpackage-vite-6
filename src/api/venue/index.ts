import request from '@/axios'
export const getVenueListApi = (params: any) => {
  return request.get({ url: '/api/venues', params })
}
