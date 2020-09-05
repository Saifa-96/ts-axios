import { AxiosRequestConfig } from './types'
import { processHeaders } from './helper/headers'
import { transformRequest, transformResponse } from './helper/data'
const defaults: AxiosRequestConfig = {
  method: 'get',
  timeout: 0,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  transformRequest: [
    function(data, headers) {
      processHeaders(headers, data)
      return transformRequest(data)
    }
  ],
  transformResponse: [
    function(data) {
      return transformResponse(data)
    }
  ],
  validateStatus(status: number): boolean {
    return status >= 200 && status < 300
  }
}

const methodsNoData = ['delete', 'get', 'head', 'options']
methodsNoData.forEach(methodName => (defaults.headers[methodName] = {}))

const methodsWithData = ['post', 'put', 'patch']
methodsWithData.forEach(
  methodName =>
    (defaults.headers[methodName] = { 'Content-Type': 'application/x-www-form-urlencoded' })
)

export default defaults
