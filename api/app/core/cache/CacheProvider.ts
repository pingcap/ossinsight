
export interface CacheOption {
    EX: number;
}

export interface CacheProvider {
    set(key: string, value: any, options?: CacheOption): void;
    get(key: string): any;
}