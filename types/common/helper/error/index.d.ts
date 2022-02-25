declare type Params = {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
};
export declare function handlerError(key: string, data: unknown, { type, required }: Params): {
    success: boolean;
    message: string;
};
export {};
