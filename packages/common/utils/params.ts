import { isObject } from ".";

export const sortParams = (params: Record<string, unknown> | undefined) => {
  if (!params || !isObject(params)) return {};
  const keys = Object.keys(params);
  return keys.sort().reduce((pre, key) => {
    pre[key] = params[key];
    return pre;
  }, {} as Record<string, unknown>)
}

export const pathReplace = (string: string) => string.replace(/\./g, '/');