const toString = Object.prototype.toString

export function isDate(val: any): val is Date {
  return toString.call(val) === '[object Date]'
}

export function isPlainObject(obj: object): obj is Object {
  return toString.call(obj) === '[object Object]'
}
