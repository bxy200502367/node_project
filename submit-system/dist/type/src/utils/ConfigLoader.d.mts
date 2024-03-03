declare class ConfigLoader {
    static configCache: {
        [key: string]: any;
    };
    static loadConfig<T>(configPath: string, name: string, defaultConfig: () => T): T;
}
export { ConfigLoader };
//# sourceMappingURL=ConfigLoader.d.mts.map