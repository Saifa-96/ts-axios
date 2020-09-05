import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helper/headers'
import { createError } from '../helper/error'
import cookie from '../helper/cookie'
import { isURLSameOrigin } from '../helper/url'
import { isFormData } from '../helper/utils'
import { head } from 'shelljs'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      url,
      data = null,
      params,
      method = 'GET',
      headers = {},
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config
    const request = new XMLHttpRequest()

    request.open(method.toUpperCase(), url!, true)

    configureRequest()
    addEvents()
    processHeaders()
    processCancel()

    request.send(data)

    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = withCredentials
      }
    }

    function addEvents(): void {
      request.onreadystatechange = function() {
        if (request.readyState !== 4) return
        if (request.status === 0) return
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

        handleResponse(response)
      }

      request.onerror = function() {
        reject(createError({ message: 'Network Error', config, code: null, request }))
      }

      request.ontimeout = function() {
        reject(
          createError({
            message: `Timeout of ${config.timeout} ms exceeded`,
            config,
            code: 'ECONNABORTED',
            request
          })
        )
      }

      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    function processHeaders(): void {
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue && xsrfHeaderName) {
          headers[xsrfHeaderName] = xsrfValue
        }
      }

      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

      for (const name in headers) {
        if (data === null && headers[name].toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      }
    }

    function processCancel(): void {
      if (cancelToken) {
        cancelToken.promise
          .then(reason => {
            request.abort()
            reject(reason)
          })
          .catch(
            /* istanbul ignore next */
            () => {
              // do nothing
            }
          )
      }
    }

    function handleResponse(response: AxiosResponse): void {
      const statusCode = response.status
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response)
      } else {
        reject(
          createError({
            message: 'Request failed with status code ' + statusCode,
            config,
            code: null,
            request,
            response
          })
        )
      }
    }
  })
}
