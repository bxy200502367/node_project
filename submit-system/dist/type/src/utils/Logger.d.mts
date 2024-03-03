declare class Logger {
    private readonly logger;
    private xiaomei;
    private DS;
    private errorMessages;
    constructor(configFilePath?: string);
    private loadJsonFile;
    info(message: any): void;
    warn(message: any): void;
    error(message: any): void;
}
export { Logger };
//# sourceMappingURL=Logger.d.mts.map