import { signMethods } from "@/common/sign";
import { isFunction, pathReplace, sortParams } from "@/common/utils";
import request from "@/common/request";
// import classDecorator from "./decorator/classDecorator";
// import { ClientConstructor } from "./dto";

type SignMethod = 'MD5' | 'HMAC_SHA256';

type CommonParams = {
  appKey: string,
  signSecret: string,
  url?: string,
  signMethod?: SignMethod,
}


type SystemParams = {
  version: number,
  access_token: string,
}

// @classDecorator(ClientConstructor)
class KsMerchantClient {
  appKey: string;
  signSecret: string;
  url: string;
  signMethod: SignMethod;

  constructor(commonParams: CommonParams) {
    this.appKey = commonParams.appKey;
    this.signSecret = commonParams.signSecret;
    this.signMethod = commonParams.signMethod || 'MD5';
    this.url = commonParams.url || 'https://openapi.kwaixiaodian.com';
  }

  private generateSign(appkey: string, signSecret: string, method: string, signMethod: SignMethod, timestamp: number, systemParams: SystemParams, paramString: string) {
    const { access_token, version = 1 } = systemParams;
    const data = `access_token=${access_token}&appkey=${appkey}&method=${method}&param=${paramString}&signMethod=${signMethod}&timestamp=${timestamp}&version=${version}&signSecret=${signSecret}`;
    const signMethodFunction = signMethods[signMethod];
    if (!isFunction(signMethodFunction)) throw Error(`signMethod [${signMethod}] is not support`);
    return signMethods[signMethod](data, signSecret);
  }

  public execute(api: string, method: 'GET' | 'POST', systemParams: SystemParams, params?: Record<string, unknown>) {
    const sortedParams = sortParams(params);
    const paramsString = JSON.stringify(sortedParams);
    const requestUrl = `${this.url}/${pathReplace(api)}`;
    const timestamp = +new Date();
    const sign = this.generateSign(this.appKey, this.signSecret, api, this.signMethod, timestamp, systemParams, paramsString);
    let _data = {};
    let _params = {};
    const baseParams = { ...systemParams, signMethod: this.signMethod, timestamp, sign, method: api };
    if (method === 'POST') {
      _data = { param: sortedParams, ...baseParams };
    } else {
      _params = { param: paramsString, ...baseParams }
    }
    return request({ url: requestUrl, method: method, params: { appkey: this.appKey, ..._params }, data: _data })
  }
}

const client = new KsMerchantClient({ appKey: 'ks698057945834178647', signSecret: '0999d6ce9182b1b3f2cc454a6558096b', url: 'https://gw-merchant-staging.test.gifshow.com', signMethod: 'HMAC_SHA256' });
client.execute('open.item.get', 'GET', 
    { 
      version: 1, 
      access_token: 'ChFvYXV0aC5hY2Nlc3NUb2tlbhJg_j2pGQV4IuvBRHiBVdK63ZNgDASeJpMbx4kqlc3ZYEpyiD0XpVKLYO37iEp37tzE4VvvOPRL3yVrvIXcrVEB5ltl-KraiuwNpQjq0c8L0hwKuLUlT-IK7ZWQZrfZxwq8GhJV6KqXoNxmcUNkWZ68zhbiC44iILsvxZo2sWzOQH68Fz8J-3JMMFUHIF04wdDwvNBSeCAZKAUwAQ' 
    }, { kwaiItemId: 403521383905 });
    
export default KsMerchantClient;