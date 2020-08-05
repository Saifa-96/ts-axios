import { isDate, isPlainObject } from './utils'

function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function bliudURL(url: string, params?: any): string {
  if (!params) return url

  // 格式化查询字符串参数
  const parts: string[] = []
  for (let key in params) {
    const val = params[key]
    let vals = []
    if (val === null || typeof val === 'undefined') continue
    if (Array.isArray(val)) {
      vals = val
      key += '[]'
    } else {
      vals = [val]
    }
    vals.forEach(val => {
      if (isDate(val)) {
        val = val.toISOString()
      } else if (isPlainObject(val)) {
        val = JSON.stringify(val)
      }
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  }
  const queryStr = parts.join('&')

  // 拼接查询字符串参数
  if (queryStr) {
    const markIndex = url.indexOf('#')
    markIndex !== -1 && (url = url.slice(0, markIndex))
    url += (url.indexOf('?') === -1 ? '?' : '&') + queryStr
  }

  return url
}
