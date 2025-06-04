/* eslint-disable no-unused-vars */
export enum UIState {
  default = 'default',
  loading = 'loading',
  success = 'success',
  error = 'error'
}

export type Form = {
  media: File[]
  message: string
  name: string
}
