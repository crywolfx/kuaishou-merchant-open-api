export declare enum SignMethod {
    HMAC_SHA256 = "HMAC_SHA256",
    MD5 = "MD5"
}
export declare const signMethods: {
    HMAC_SHA256: (message: string, key?: string) => string;
    MD5: (message: string) => string;
};
