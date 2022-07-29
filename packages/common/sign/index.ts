import hmacSHA256 from 'crypto-js/hmac-sha256';
import md5 from 'crypto-js/md5';
import Base64 from 'crypto-js/enc-base64';
import { SignMethod } from '../interface';

export const signMethods = {
  [SignMethod.HMAC_SHA256]: (message: string, key = '') => Base64.stringify(hmacSHA256(message, key)),
  [SignMethod.MD5]: (message: string) => md5(message).toString()
}
