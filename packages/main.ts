import { signMethods } from '@/common/sign';
import { formatParams, isFunction, params2FormData, pathReplace, sortParams } from '@/common/utils';
import service from '@/common/request';
import { ClientConstructorDTO } from '@/dto/constructor.dto';
import { ApiResponse, SignMethod, ApiDeclaration, Method } from '@/common/interface';
import { ValidateClass, Required, Validate, throwError } from '@/decorator/validate.decorator';
import { ExecuteBaseDTO } from '@/dto/execute.dto';
import { SignDTO } from '@/dto/sign.dto';
import defaultMethod from '@/common/constant/api.default.method';
import { GetAccessTokenDTO, RefreshTokenDTO } from './dto/accessToken.dto';
import { AccessTokenResponse } from './common/interface/accessToken';

@ValidateClass()
class KsMerchantClient {
  /**
   * 开发者appKey
   * @memberof KsMerchantClient
   */
  public appKey: string;

  /**
   * 开发者appSecret
   * @memberof KsMerchantClient
   */
  public appSecret: string;

  /**
   * 开发者signSecret
   *
   * @memberof KsMerchantClient
   */
  public signSecret: string;

  /**
   * 请求域名
   * 线上: https://openapi.kwaixiaodian.com
   * 备用: https://open.kwaixiaodian.com
   * @memberof KsMerchantClient
   */
  public url: string;

  /**
   * 加密类型
   * 可选 MD5/HMAC_SHA256
   * @default MD5
   * @memberof KsMerchantClient
   */
  public signMethod: SignMethod = SignMethod.MD5;

  /**
   * 临时访问令牌，作为调用授权API时的入参，过期时间为accessTokenExpiresIn值，授权用户、app和权限组范围唯一决定一个access_token值
   * @memberof KsMerchantClient
   */
  public accessToken: string;

  /**
   * 长时访问令牌，默认为180天，授权用户、app和权限组范围唯一决定一个refresh_token值
   * @memberof KsMerchantClient
   */
  public refreshToken: string;


  /**
   * 用户对该开发者的唯一身份标识
   * @memberof KsMerchantClient
   */
  public openId: string;


  /**
   * 本次授权中，用户允许的授权权限范围，即accessToken和refreshToken中包含的scopes
   * @memberof KsMerchantClient
   */
  public scopes: string[] = [];


  /**
   * accessToken过期时间，单位秒，默认为172800，即48小时
   * @memberof KsMerchantClient
   */
  public accessTokenExpiresIn: number;

  /**
   * refreshToken过期时间，单位秒，默认为15552000，即180天
   * @memberof KsMerchantClient
   */
  public refreshTokenExpiresIn: number;

  constructor(@Required commonParams: ClientConstructorDTO) {
    this.appKey = commonParams?.appKey;
    this.signSecret = commonParams?.signSecret;
    this.appSecret = commonParams?.appSecret;
    this.signMethod = commonParams?.signMethod || SignMethod.MD5;
    this.url = commonParams?.url || 'https://openapi.kwaixiaodian.com';
    this.accessToken = commonParams?.accessToken;
  }

  private generateApiUrl(api: string) {
    const url = new URL(this.url);
    url.pathname = pathReplace(api);
    return url.toString();
  }

  private setToken(res: AccessTokenResponse) {
    const { access_token: accessToken, refresh_token: refreshToken, open_id: openId, scopes, expires_in: accessTokenExpiresIn, refresh_token_expires_in: refreshTokenExpiresIn } = res || {};
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.accessTokenExpiresIn = accessTokenExpiresIn;
    this.refreshTokenExpiresIn = refreshTokenExpiresIn;
    this.openId = openId || this.openId;
    this.scopes = scopes || this.scopes;
    return { accessToken, refreshToken, openId: this.openId, scopes, accessTokenExpiresIn, refreshTokenExpiresIn };
  }

  /**
   * 通过授权获取到的code换取accessToken
   * @memberof KsMerchantClient
   */
  @Validate()
  public getAccessTokenByCode(@Required { code, appSecret = this.appSecret, appKey = this.appKey }: GetAccessTokenDTO) {
    const url = this.generateApiUrl('/oauth2/access_token');
    return service.request<unknown, AccessTokenResponse>({ method: 'GET', url, params: { code, grant_type: 'code', app_id: appKey, app_secret: appSecret } }).then((res) => {
      if (res?.result !== 1) return Promise.reject({
        result: res.result,
        error: res.error || 'error',
        errorMsg: res.error_msg || 'error'
      });

      return this.setToken(res);
    });
  }

  /**
   * 通过refreshToken换取accessToken
   * @memberof KsMerchantClient
   */
  @Validate()
  public getAccessTokenByRefreshToken(@Required { refreshToken = this.refreshToken, appSecret = this.appSecret, appKey = this.appKey }: RefreshTokenDTO = {}) {
    if (!refreshToken) throw Error('refreshToken should not be empty');
    const url = this.generateApiUrl('/oauth2/refresh_token');
    return service.request<unknown, AccessTokenResponse>({ method: 'POST', url, params: { grant_type: 'refresh_token', refresh_token: refreshToken, app_id: appKey, app_secret: appSecret } }).then((res) => {
      if (res?.result !== 1) return Promise.reject({
        result: res.result,
        error: res.error || 'error',
        errorMsg: res.error_msg || 'error'
      });
      return this.setToken(res);
    })
  }

  /**
   * 生成sign
   *
   * @param {SignDTO} { appkey, signSecret, method, signMethod, timestamp, accessToken, version, param }
   * @return {*} 
   * @memberof KsMerchantClient
   */
  @Validate()
  public generateSign(@Required { appkey, signSecret, method, signMethod, timestamp, accessToken, version, param }: SignDTO) {
    const data = `access_token=${accessToken}&appkey=${appkey}&method=${method}&param=${param}&signMethod=${signMethod}&timestamp=${timestamp}&version=${version}&signSecret=${signSecret}`;
    const signMethodFunction = signMethods[signMethod];
    if (!isFunction(signMethodFunction)) throw Error(`signMethod [${signMethod}] is not support`);
    return signMethods[signMethod](data, signSecret);
  }

  @Validate()
  public execute<T extends keyof ApiDeclaration>(@Required { api, method, version = 1, accessToken = this.accessToken }: ExecuteBaseDTO<T>, orgParams?: ApiDeclaration[T]['request']) {
    if (!accessToken) throw Error('accessToken should not be empty');
    const { params = {}, file = {} } = formatParams(orgParams) || {};
    const isUpload = Object.keys(file).length > 0;
    method = method || (defaultMethod[api] as Method) || (isUpload ? 'POST' : 'GET');
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
      accessToken: accessToken,
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