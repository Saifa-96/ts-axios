import { isPlainObject, deepMerge } from './utils'
import { Method } from '../types'
import { head } from 'shelljs'

function normalizeHeaderName(headers: any, normalizeName: string): void {
  if (!headers) return
  for (const name in headers) {
    if (name !== normalizeName && name.toUpperCase() === normalizeName.toUpperCase()) {
      headers[normalizeName] = headers[name]
      delete headers[name]
    }
  }
}

export function processHeaders(headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')

  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

export function parseHeaders(headers: string): Object {
  const parsed = Object.create(null)
  if (!headers) return parsed
  headers.split('\r\n').forEach(line => {
    let [key, ...vals] = line.split(':')
    key = key.trim().toLowerCase()
    if (!key) {
      return
    }
    let val = vals.join(':')
    if (val) {
      val = val.trim()
    }
    parsed[key] = val
  })

  return parsed
}

// export function parseHeaders(headers: string): any {
//   let parsed = Object.create(null)
//   if (!headers) {
//     return parsed
//   }

//   headers.split('\r\n').forEach(line => {
//     let [key, ...vals] = line.split(':')
//     key = key.trim().toLowerCase()
//     if (!key) {
//       return
//     }
//     const val = vals.join(':').trim()
//     parsed[key] = val
//   })

//   return parsed
// }

export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) return headers
  headers = deepMerge(headers.common, headers[method], headers)
  const methodsToDelete = ['post', 'put', 'patch', 'get', 'delete', 'head', 'options', 'common']
  methodsToDelete.forEach(methodName => {
    delete headers[methodName]
  })
  return headers
}
