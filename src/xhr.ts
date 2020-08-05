import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './types'
import { parseHeaders } from './helper/headers'
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise(resolve => {
    const { url, data = null, params, method = 'GET', headers, responseType } = config
    const request = new XMLHttpRequest()

    responseType && (request.responseType = responseType)

    request.onreadystatechange = function() {
      if (request.readyState !== 4) return
      const responseHeaders = parseHeaders(request.getAllResponseHeaders())
      const responseData = responseType === 'text' ? request.responseText : request.response
      const response: AxiosResponse = {
        status: request.status,
        statusText: request.statusText,
        data: responseData,
        headers: responseHeaders,
        config,
        request
      }

      resolve(response)
    }

    request.open(method.toUpperCase(), url, true)
    for (const name in headers) {
      if (data === null && headers[name].toLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    }
    request.send(data)
  })
}
