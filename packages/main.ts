import { signMethods } from "@/common/sign";
import { formatParams, isFunction, params2FormData, pathReplace, sortParams } from "@/common/utils";
import request from "@/common/request";
import { ClientConstructorDTO } from "@/dto/constructor.dto";
import { SignMethod } from "@/common/interface";
import { ValidateClass, Required, Validate } from "@/decorator/validate.decorator";
import { ExecuteBaseDTO } from '@/dto/execute.dto';
import { SignDTO } from "@/dto/sign.dto";

@ValidateClass()
class KsMerchantClient {
  appKey: string;
  signSecret: string;
  url: string;
  signMethod: SignMethod;
  accessToken: string;

  constructor(@Required commonParams: ClientConstructorDTO) {
    this.appKey = commonParams?.appKey;
    this.signSecret = commonParams?.signSecret;
    this.signMethod = commonParams?.signMethod || SignMethod.MD5;
    this.url = commonParams?.url || 'https://openapi.kwaixiaodian.com';
    this.accessToken = commonParams?.accessToken;
  }

  public generateApiUrl(api: string) {
    const url = new URL(this.url);
    url.pathname = pathReplace(api);
    return url.toString();
  }

  @Validate()
  public generateSign(@Required { appkey, signSecret, method, signMethod, timestamp, accessToken, version, param }: SignDTO) {
    const data = `access_token=${accessToken}&appkey=${appkey}&method=${method}&param=${param}&signMethod=${signMethod}&timestamp=${timestamp}&version=${version}&signSecret=${signSecret}`;
    const signMethodFunction = signMethods[signMethod];
    if (!isFunction(signMethodFunction)) throw Error(`signMethod [${signMethod}] is not support`);
    return signMethods[signMethod](data, signSecret);
  }

  @Validate()
  public execute(@Required { api, method = 'GET', version = 1 }: ExecuteBaseDTO, orgParams?: Record<string, unknown>) {
    const { params = {}, file = {} } = formatParams(orgParams) || {};
    const isUpload = Object.keys(file).length > 0;
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

    let _data: any;
    let _params = {};
    let header = {};
    const baseParams = { appkey: this.appKey, version, access_token: this.accessToken, signMethod: this.signMethod, timestamp, sign, method: api };
    if (method === 'POST') {
      if (isUpload) {
        _data = params2FormData({ param: paramsString, ...file, ...baseParams });
        header = { ..._data.getHeaders() }
      } else {
        _data = new URLSearchParams({ param: paramsString, ...baseParams } as any).toString();
      }
    } else {
      _params = { param: paramsString, ...baseParams }
    }
    return request({ url: requestUrl, method: method, params: _params, data: _data, headers: header })
  }
}

export default KsMerchantClient;

// const client = new KsMerchantClient({ appKey: 'ks698057945834178647', signSecret: '0999d6ce9182b1b3f2cc454a6558096b', url: 'https://gw-merchant-staging.test.gifshow.com/', accessToken: 'ChFvYXV0aC5hY2Nlc3NUb2tlbhIw2X_PNucU_x8_XydoTYOKBkQ8YVDTQQC3vWfBdHUF35OhtM-FQu8vI0yNU-LJiNCEGhKxiMDMw-rDsMoxRnwv4VUtch8iIOH2BN5flsOI5BruC-6ROqBEMELI_fuZgUrfkJAu87l3KA8wAQ' });

// client.execute({ api: 'open.user.sub.account.list' }).then((res) => {
//   console.log(res);
// })