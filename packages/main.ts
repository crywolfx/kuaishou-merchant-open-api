import { signMethods } from '@/common/sign';
import { formatParams, isFunction, params2FormData, pathReplace, sortParams } from '@/common/utils';
import service from '@/common/request';
import { ClientConstructorDTO } from '@/dto/constructor.dto';
import { ApiResponse, SignMethod, ApiDeclaration, Method } from '@/common/interface';
import { ValidateClass, Required, Validate } from '@/decorator/validate.decorator';
import { ExecuteBaseDTO } from '@/dto/execute.dto';
import { SignDTO } from '@/dto/sign.dto';
import defaultMethod from '@/common/constant/api.default.method';

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
  public execute<T extends keyof ApiDeclaration>(@Required { api, method, version = 1 }: ExecuteBaseDTO<T>, orgParams?: ApiDeclaration[T]['request']) {
    const { params = {}, file = {} } = formatParams(orgParams) || {};
    const isUpload = Object.keys(file).length > 0;
    method = method || (defaultMethod[api] as Method) ||  (isUpload ? 'POST' : 'GET');
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
    return service.request<unknown, ApiResponse<ApiDeclaration[T]['response']>>({ url: requestUrl, method: method, params: _params, data: _data, headers: header });
  }
}

export default KsMerchantClient;
