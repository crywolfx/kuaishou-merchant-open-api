import FormData from 'form-data';
export declare const sortParams: (params: Record<string, unknown> | undefined) => Record<string, unknown>;
export declare const pathReplace: (string: string) => string;
export declare const formatParams: (params: Record<string, any>) => {
    params: Record<string, any>;
    file: Record<string, any>;
};
export declare const params2FormData: (params: Record<string, any>) => FormData;
