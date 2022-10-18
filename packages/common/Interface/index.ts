export * from './api.declaration';

export enum SignMethod {
  HMAC_SHA256 = 'HMAC_SHA256',
  MD5 = 'MD5'
}
export interface CommonParams {
  appKey: string;
  signSecret: string;
  url?: string;
  signMethod?: SignMethod;
  accessToken: string;
}

export interface SignParams {
  appkey: string;
  signSecret: string;
  method: string;
  signMethod: SignMethod;
  timestamp: number;
  version: number;
  accessToken: string;
  param: string;
}

export type Method = 'GET' | 'POST';

export type ApiResponse<T = any> = {
  result: number;
  error_msg: string;
  requestId: string;
} & T;