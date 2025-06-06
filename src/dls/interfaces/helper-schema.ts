export interface HelperResolverSchema {
    resolver: Function;
    async: boolean;
}

export interface HelperSchema {
    name: string;
    description: string;
    example: string;
    category: string;
}