
export interface CacheOption {
    EX: number;
}

export interface CacheProvider {
    set(key: string, value: any, options?: CacheOption): Promise<any>;
    get(key: string): Promise<any>;
}