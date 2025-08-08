export type VenueData = {
  address: {
    name: string
    latitude: number
    longitude: number
  }
  isDelete: boolean
  selfAdImages: string[]
  isOpen: boolean
  isShowNum: boolean
  _id: string
  __v: number
  _organization: string
  businessHours: string
  closeItems: {
    closeOpen: boolean
    showRemark: boolean
    _id: string
    _item: string
  }[]
  createDate: string
  discount: number
  image: string
  isUsed: boolean
  name: string
  openSpe: boolean
  orderDay: number
  sortNum: number
  tel: string
  venueNo: string
  vr_url: string
  selfAdVideo: string
  info: string
  showNumType: string
  loc: [number, number]
  openTime: string
  area: string
  city: string
  province: string
  openItems: {
    _id: string
    _item: string
  }[]
  wendu: string
  projectNameArr: string[]
}
