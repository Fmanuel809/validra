export interface HelperResolverSchema {
    resolver: Function;
    async: boolean;
    params: readonly string[];
}

export interface HelperSchema {
    name: string;
    description: string;
    example: string;
    category: string;
}