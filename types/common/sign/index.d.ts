/// <reference types="crypto-js" />
export declare enum SignMethod {
    HMAC_SHA256 = "HMAC_SHA256",
    MD5 = "MD5"
}
export declare const signMethods: {
    HMAC_SHA256: (message: string, key?: string) => CryptoJS.lib.WordArray;
    MD5: (message: string, cfg?: object | undefined) => CryptoJS.lib.WordArray;
};
