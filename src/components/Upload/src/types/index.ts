import type { UploadProps, UploadFile, UploadFiles } from 'element-plus'

export interface UploadComponentProps extends Partial<UploadProps> {
  // 自定义属性
  valueType?: 'string' | 'array' | 'object' // 返回值的类型
  responseKey?: string // 响应数据中文件URL的键名
  urlKey?: string // 文件对象中URL的键名
  showTrigger?: boolean
  tip?: string
  placeholder?: string
  maxSize?: number // MB
  slots?: {
    default?: (...args: any[]) => JSX.Element | null
    trigger?: (...args: any[]) => JSX.Element | null
    tip?: (...args: any[]) => JSX.Element | null
    file?: (...args: any[]) => JSX.Element | null
  }
  style?: Record<string, any>
  on?: {
    success?: (response: any, file: UploadFile, fileList: UploadFiles) => void
    error?: (error: Error, file: UploadFile, fileList: UploadFiles) => void
    change?: (file: UploadFile, fileList: UploadFiles) => void
    remove?: (file: UploadFile, fileList: UploadFiles) => void
    exceed?: (files: File[], fileList: UploadFiles) => void
    'before-upload'?: (file: UploadFile) => boolean | Promise<boolean>
    'before-remove'?: (file: UploadFile, fileList: UploadFiles) => boolean | Promise<boolean>
    progress?: (evt: ProgressEvent, file: UploadFile, fileList: UploadFiles) => void
  }
}

export interface UploadEmits {
  'update:fileList': [fileList: UploadFiles]
  'update:modelValue': [value: string | string[] | UploadFiles]
  change: [file: UploadFile, fileList: UploadFiles]
  remove: [file: UploadFile, fileList: UploadFiles]
  success: [response: any, file: UploadFile, fileList: UploadFiles]
  error: [error: Error, file: UploadFile, fileList: UploadFiles]
  progress: [evt: ProgressEvent, file: UploadFile, fileList: UploadFiles]
  exceed: [files: File[], fileList: UploadFiles]
  'before-upload': [file: UploadFile]
  'before-remove': [file: UploadFile, fileList: UploadFiles]
}
