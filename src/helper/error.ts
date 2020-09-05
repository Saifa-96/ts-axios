import { AxiosRequestConfig, AxiosResponse } from '../types'
interface AxiosErrorParams {
  message: string
  config: AxiosRequestConfig
  code?: string | null
  request?: any
  response?: AxiosResponse
}

export class AxiosError extends Error {
  config: AxiosRequestConfig
  code?: string | number | null
  request?: any
  response?: AxiosResponse
  isAxiosError: boolean

  constructor({ message, config, code, request, response }: AxiosErrorParams) {
    super(message)
    this.config = config
    this.code = code
    this.request = request
    this.response = response
    this.isAxiosError = true

    Object.setPrototypeOf(this, AxiosError.prototype)
  }
}

export function createError({
  message,
  config,
  code,
  request,
  response
}: AxiosErrorParams): AxiosError {
  const error = new AxiosError({ message, config, code, request, response })
  return error
}
