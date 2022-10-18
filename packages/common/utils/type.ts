import FormData from 'form-data';

export function isFunction(val: unknown): val is (...args: unknown[]) => unknown {
  return Object.prototype.toString.call(val) === '[object Function]';
}
export function isArray<T>(val: unknown): val is T[] {
  return Object.prototype.toString.call(val) === '[object Array]';
}
export function isDate(val: unknown): val is Date {
  return Object.prototype.toString.call(val) === '[object Date]';
}
export function isString(val: unknown): val is string {
  return Object.prototype.toString.call(val) === '[object String]';
}
export function isBoolean(val: unknown): val is boolean {
  return Object.prototype.toString.call(val) === '[object Boolean]';
}
export function isNumber(val: unknown): val is number {
  return Object.prototype.toString.call(val) === '[object Number]';
}
export function isRegExp(val: unknown): val is RegExp {
  return Object.prototype.toString.call(val) === '[object RegExp]';
}
export function isObject<T>(val: unknown): val is Record<string, T> {
  return Object.prototype.toString.call(val) === '[object Object]';
}
export function isFormData(val: unknown): val is FormData {
  return Object.prototype.toString.call(val) === '[object FormData]';
}
export function isUndefined(val: unknown): val is undefined {
  return val === undefined;
}
export function isNull(val: unknown): val is null {
  return val === null;
}
export function isDef(val: unknown) {
  return !isUndefined(val) && !isNull(val);
}


export function objectKeys<T, K extends keyof T>(object: T) {
  return Object.keys(object) as K[];
}
