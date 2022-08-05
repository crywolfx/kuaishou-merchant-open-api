import FormData from 'form-data';
import { isObject } from "./type";
import { Buffer } from 'buffer';
import { Stream } from 'stream';

export const sortParams = (params: Record<string, unknown> | undefined) => {
  if (!params || !isObject(params)) return {};
  const keys = Object.keys(params);
  return keys.sort().reduce((pre, key) => {
    pre[key] = params[key];
    return pre;
  }, {} as Record<string, unknown>)
}

export const pathReplace = (string: string) => string.replace(/\./g, '/');

export const formatParams = (params: Record<string, any>) => {
  if (!isObject(params)) return params;
  return Object.keys(params).reduce<{ params: Record<string, any>; file: Record<string, any>}>((pre, key) => {
    const value = params[key];
    if (value instanceof Buffer || value instanceof Stream) {
      pre.file[key] = value;
    } else {
      pre.params[key] = value;
    }
    return pre;
  }, { params: {}, file: {} })
}

export const params2FormData = (params: Record<string, any>) => {
  if (!isObject(params)) return params;
  return Object.keys(params).reduce<FormData>((pre, key) => {
    pre.append(key, params[key]);
    return pre;
  }, new FormData())
}