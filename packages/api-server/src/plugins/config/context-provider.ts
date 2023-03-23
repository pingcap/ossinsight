export interface ContextProvider {
    provide(context: Record<string, any>): Promise<Record<string, any>>;
}