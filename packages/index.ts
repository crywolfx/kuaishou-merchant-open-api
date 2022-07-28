import 'reflect-metadata';
import { signMethods } from "@/common/sign";
import { isFunction, pathReplace, sortParams } from "@/common/utils";
import request from "@/common/request";
import { ClientConstructorDTO } from "./dto/constructor";
import { BaseParams, SignMethod, SignParams } from "./common/Interface";
import ValidateClass, { required } from "./decorator/validate.decorator";

@ValidateClass()
class KsMerchantClient {
  appKey: string;
  signSecret: string;
  url: string;
  signMethod: SignMethod;
  accessToken: string;

  constructor(@required commonParams: ClientConstructorDTO, f?: string) {
    this.appKey = commonParams.appKey;
    this.signSecret = commonParams.signSecret;
    this.signMethod = commonParams.signMethod || SignMethod.MD5;
    this.url = commonParams.url || 'https://openapi.kwaixiaodian.com';
    this.accessToken = commonParams.accessToken;
  }

  public generateApiUrl(api: string) {
    const url = new URL(this.url);
    url.pathname = pathReplace(api);
    return url.toString();
  }

  public generateSign({ appkey, signSecret, method, signMethod, timestamp, accessToken, version, param }: SignParams) {
    const data = `access_token=${accessToken}&appkey=${appkey}&method=${method}&param=${param}&signMethod=${signMethod}&timestamp=${timestamp}&version=${version}&signSecret=${signSecret}`;
    const signMethodFunction = signMethods[signMethod];
    if (!isFunction(signMethodFunction)) throw Error(`signMethod [${signMethod}] is not support`);
    return signMethods[signMethod](data, signSecret);
  }

  public execute({ api, method = 'GET', version = 1 }: BaseParams, params?: Record<string, unknown>) {
    const sortedParams = sortParams(params);
    const paramsString = JSON.stringify(sortedParams);
    const requestUrl = this.generateApiUrl(api);
    const timestamp = +new Date();
    const sign = this.generateSign({
      appkey: this.appKey,
      signSecret: this.signSecret,
      method: api,
      signMethod: this.signMethod,
      timestamp: timestamp,
      accessToken: this.accessToken,
      version: version,
      param: paramsString,
    });
    let _data = {};
    let _params = {};
    const baseParams = { version, access_token: this.accessToken, signMethod: this.signMethod, timestamp, sign, method: api };
    if (method === 'POST') {
      _data = { param: sortedParams, ...baseParams };
    } else {
      _params = { param: paramsString, ...baseParams }
    }
    return request({ url: requestUrl, method: method, params: { appkey: this.appKey, ..._params }, data: _data })
  }
}


const client = new KsMerchantClient({ 
  appKey: 'ks698057945834178647', 
  signSecret: '0999d6ce9182b1b3f2cc454a6558096b', 
  url: 'https://gw-merchant-staging.test.gifshow.com', 
  signMethod: SignMethod.HMAC_SHA256, 
  accessToken: 'ChFvYXV0aC5hY2Nlc3NUb2tlbhJQcXTxsmfBI-MmTPq-8RA4XXLqHYBgL-LIbq14aG6ipNRctF5DNn3nCdBhSEP4Bnj3-UWY5dQYOOneBCGQVobb2q36quEkG_UyKSKxPLZf0zsaEo7B5Wo_nFObXbP8SpF4FHeKhiIgJKvxBKLPn1eqk97E29gEXHpOAvczy-5o3Bx-4X5oQH0oDzAB' 
}, 'ffffff');

client.execute({ api: 'open.item.get' }, { kwaiItemId: 113194872370 }).then((result) => {
    console.log(result);
  })

export default KsMerchantClient;


// function validate(
//   target: any,
//   key: string,
//   descriptor: PropertyDescriptor
// ) {
//   const originalFn = descriptor.value;

//   // 获取参数的编译期类型
//   const designParamTypes = Reflect.getMetadata('design:paramtypes', target, key);

//   descriptor.value = function (...args: any[]) {
//     args.forEach((arg, index) => {
//       const paramType = designParamTypes[index];
//       // if (arg.constructor === paramType || arg instanceof paramType) {

//       // }
//     });

//     return originalFn.call(this, ...args);
//   }
// }


// class C {
//   @validate
//   sayRepeat(word: ClientConstructorDTO, x: number) {
//     return word
//   }
// }

// const c = new C();
// c.sayRepeat({
//   appKey: 'ks698057945834178647',
//   signSecret: '0999d6ce9182b1b3f2cc454a6558096b',
//   url: 'https://gw-merchant-staging.test.gifshow.com',
//   signMethod: SignMethod.HMAC_SHA256,
//   accessToken: 'ChFvYXV0aC5hY2Nlc3NUb2tlbhJQcXTxsmfBI-MmTPq-8RA4XXLqHYBgL-LIbq14aG6ipNRctF5DNn3nCdBhSEP4Bnj3-UWY5dQYOOneBCGQVobb2q36quEkG_UyKSKxPLZf0zsaEo7B5Wo_nFObXbP8SpF4FHeKhiIgJKvxBKLPn1eqk97E29gEXHpOAvczy-5o3Bx-4X5oQH0oDzAB'
// }, 2); // pass