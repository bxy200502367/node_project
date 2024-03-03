import { Db, Collection, MongoClient } from 'mongodb';
interface MongodbConnectionArgs {
    types?: string;
    configPath?: string;
}
declare class MongodbConnection {
    private static readonly DEFAULT_CONFIG;
    private readonly url;
    private readonly dbName;
    client: MongoClient | null;
    db: Db | null;
    constructor({ types, configPath }?: MongodbConnectionArgs);
    private loadConfig;
    connect(): Promise<void>;
    getCollection(collectionName: string): Collection;
    close(): Promise<void>;
}
export { MongodbConnection };
//# sourceMappingURL=MongodbConnection.d.mts.map