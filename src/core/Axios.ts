import {
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  ResolvedFn,
  RejectedFn
} from '../types'
import dispathRequest, { transformURL } from './dispathRequest'
import InterceptorManager from './interceptorManager'
import mergeConfig from './mergeConfig'

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosResponse>
}

interface PromiseChain<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosResponse)
  rejected?: RejectedFn
}

export default class Axios {
  defaults: AxiosRequestConfig
  interceptors: Interceptors

  constructor(initConfig: AxiosRequestConfig) {
    this.defaults = initConfig
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosResponse>()
    }
  }

  request(url: string | AxiosRequestConfig, config?: AxiosRequestConfig): AxiosPromise {
    if (typeof url === 'string') {
      config = { ...(config || {}), url }
    } else {
      config = url
    }

    // 合并config配置内容
    config = mergeConfig(this.defaults, config)
    config.method = config.method!.toLowerCase() as Method

    // 声明promise链并添加拦截器
    const chain: PromiseChain<any>[] = [
      {
        resolved: dispathRequest,
        rejected: undefined
      }
    ]
    this.interceptors.request.forEach(interceptor => chain.unshift(interceptor))
    this.interceptors.response.forEach(interceptor => chain.push(interceptor))

    // 调用promise
    let promise = Promise.resolve(config) as AxiosPromise
    while (chain.length) {
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }

    return promise
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('GET', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('DELETE', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('HEAD', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('OPTIONS', url, config)
  }

  post(url: string, data: any = {}, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('POST', url, config, data)
  }

  put(url: string, data: any = {}, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('PUT', url, config, data)
  }

  patch(url: string, data: any = {}, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('PATCH', url, config, data)
  }

  getUri(config?: AxiosRequestConfig): string {
    config = mergeConfig(this.defaults, config)
    return transformURL(config)
  }

  _requestMethodWithoutData(method: Method, url: string, config?: AxiosRequestConfig) {
    return this.request({ ...(config || {}), method, url })
  }

  _requestMethodWithData(method: Method, url: string, config?: AxiosRequestConfig, data?: any) {
    return this.request({ ...(config || {}), method, url, data })
  }
}
