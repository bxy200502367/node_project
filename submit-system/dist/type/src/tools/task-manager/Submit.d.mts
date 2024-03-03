#!/usr/bin/env node
type Params = {
    [key: string]: boolean | number | string;
};
declare enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH"
}
interface SubmitArgs {
    api: string;
    params: Params;
    types?: string;
    method?: HttpMethod;
    configPath?: string;
}
declare class Submit {
    private static readonly DEFAULT_CONFIG;
    private readonly method;
    private readonly api;
    private readonly params;
    private readonly url;
    private readonly client;
    private readonly mysql_client_key;
    constructor({ api, params, method, types, configPath }: SubmitArgs);
    private loadConfig;
    sendApiRequest(): Promise<any>;
    private sendRequest;
    private handleResponse;
}
export { Submit };
//# sourceMappingURL=Submit.d.mts.map