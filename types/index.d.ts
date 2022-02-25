import { SignMethod } from "./common/sign";
declare type CommonParams = {
    appKey: string;
    signSecret: string;
    url?: string;
};
declare type SystemParams = {
    signMethod: SignMethod;
    timestamp: number;
    version: number;
    access_token: string;
};
declare class KsMerchantClient {
    appKey: string;
    signSecret: string;
    url: string;
    constructor(commonParams: CommonParams);
    private generateSign;
    execute(api: string, method: 'GET' | 'POST', systemParams: SystemParams, params: Record<string, unknown>): void;
}
export default KsMerchantClient;
