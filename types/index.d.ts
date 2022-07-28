declare type SignMethod = 'MD5' | 'HMAC_SHA256';
declare type CommonParams = {
    appKey: string;
    signSecret: string;
    url?: string;
    signMethod?: SignMethod;
};
declare type SystemParams = {
    version: number;
    access_token: string;
};
declare class KsMerchantClient {
    appKey: string;
    signSecret: string;
    url: string;
    signMethod: SignMethod;
    constructor(commonParams: CommonParams);
    private generateSign;
    execute(api: string, method: 'GET' | 'POST', systemParams: SystemParams, params?: Record<string, unknown>): import("axios").AxiosPromise<any>;
}
export default KsMerchantClient;
