import { isArray, isBoolean, isDef, isFunction, isNumber, isObject, isString } from '@/common/utils'

enum Type {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  array = 'array',
  object = 'object',
}

type Params = {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object',
  required?: boolean
}

const typeMap = {
  [Type.string]: isString,
  [Type.number]: isNumber,
  [Type.boolean]: isBoolean,
  [Type.array]: isArray,
  [Type.object]: isObject,
}

export function handlerError(key: string, data: unknown, { type, required = false }: Params) {
  const typeFunction = typeMap[type];
  const hasCheckFunction = isFunction(typeFunction);
  if (hasCheckFunction && typeFunction(data) || !hasCheckFunction && (!required || isDef(data) && required)) return { success: true, message: ''};
  if (required && !isDef(data)) return { success: false, message: `${key} is required. It must exist`};
  return { success: false, message: `type Error. ${key} must be a ${type}` };
}