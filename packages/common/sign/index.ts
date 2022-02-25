import hmacSHA256 from 'crypto-js/hmac-sha256';
import md5 from 'crypto-js/md5';

export enum SignMethod {
  HMAC_SHA256 = 'HMAC_SHA256',
  MD5 = 'MD5'
}

export const signMethods = {
  [SignMethod.HMAC_SHA256]: (message: string, key = '') => hmacSHA256(message, key).toString(),
  [SignMethod.MD5]: (message: string, cfg?: object | undefined) => md5(message, cfg).toString()
}
