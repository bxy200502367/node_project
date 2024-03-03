declare class DingTalk {
    private static readonly DEFAULT_CONFIG;
    private webhook;
    private secret;
    constructor(name: string, configPath?: string);
    private loadConfig;
    sendMessage(message: string): Promise<void>;
    private sendRequest;
}
export { DingTalk };
//# sourceMappingURL=DingTalk.d.mts.map