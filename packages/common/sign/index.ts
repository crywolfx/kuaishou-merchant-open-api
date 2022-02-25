import hmacSHA256 from 'crypto-js/hmac-sha256';
import md5 from 'crypto-js/md5';
import Base64 from 'crypto-js/enc-base64';

export enum SignMethod {
  HMAC_SHA256 = 'HMAC_SHA256',
  MD5 = 'MD5'
}

export const signMethods = {
  [SignMethod.HMAC_SHA256]: (message: string, key = '') => Base64.stringify(hmacSHA256(message, key)),
  [SignMethod.MD5]: (message: string) => md5(message).toString()
}
