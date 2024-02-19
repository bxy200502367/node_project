import * as path from 'path';
import { fileURLToPath } from 'url';
import to from 'await-to-js';
import { Db, Collection, MongoClient } from 'mongodb';
import { ConfigLoader } from '../../utils/ConfigLoader.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MongodbConnectionArgs {
    types?: string;
    configPath?: string;
}

interface TypeConfig {
    url: string;
    dbName: string;
}

class MongodbConnection {
    private static readonly DEFAULT_CONFIG: TypeConfig = {
        url: "mongodb://datasplit:m329ak8k39fm@10.2.9.11,10.2.9.12,10.2.9.13/datasplit?authMechanism=SCRAM-SHA-1",
        dbName: "datasplit" // 默认数据库名，如果configPath中没有提供
    };
    private readonly url: string;
    private readonly dbName: string;
    public client: MongoClient | null;
    public db: Db | null;

    /**
     * 创建一个新的MongoDB连接实例。
     * @param args - 构造函数的参数，包括配置文件路径和类型。
     * @param args.types - 提交的类型，默认为"datasplit"。
     * @param args.configPath - 配置文件的路径，默认为类中的DEFAULT_CONFIG。
     * @throws {Error} 如果配置无效或类型不存在。
     */
    constructor({ types = "datasplit", configPath = path.join(__dirname, '../../config/mongoConfig.json') }: MongodbConnectionArgs = {}) {
        const typeConfig = this.loadConfig(configPath, types);
        if (!typeConfig || !typeConfig.url || !typeConfig.dbName) {
            throw new Error(`无效的配置: ${types}`);
        }
        this.url = typeConfig.url;
        this.dbName = typeConfig.dbName;
        this.client = null;
        this.db = null;
    }

    /**
     * 加载指定类型的配置。
     * @param configPath - 配置文件的路径。
     * @param types - 配置的类型。
     * @returns 返回指定类型的配置，如果读取配置文件失败，则返回默认配置。
     */
    private loadConfig(configPath: string, types: string): TypeConfig {
        return ConfigLoader.loadConfig(configPath, types, () => MongodbConnection.DEFAULT_CONFIG);
    }

    /**
     * 异步连接到MongoDB数据库。
     * 如果已经连接，则不执行任何操作并返回。
     * @returns {Promise<void>} 连接操作的Promise。
     */
    public async connect(): Promise<void> {
        if (this.client) {
            console.log('已经和MongoDB数据库建立了连接');
            return;
        }
        try {
            const [error, client] = await to(new MongoClient(this.url).connect());
            if (error) {
                throw new Error(`连接到MongoDB数据库时出错: ${error.message}`);
            }
            this.client = client;
            this.db = this.client.db(this.dbName);
            console.log('连接到MongoDB数据库成功');
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`连接到MongoDB数据库时出错: ${error.message}`);
            } else {
                throw new Error(`连接到MongoDB数据库时出错: ${error}`);
            }
        }
    }

    /**
     * 获取MongoDB数据库中的集合。
     * @param collectionName - 集合的名称。
     * @returns {Promise<Collection>} 集合的Promise。
     * @throws {Error} 如果数据库连接没有建立。
     */
    public getCollection(collectionName: string): Collection {
        if (!this.db) {
            throw new Error('数据库连接没有建立');
        }
        return this.db.collection(collectionName);
    }

    /**
     * 关闭MongoDB数据库连接。
     * @returns {Promise<void>} 关闭操作的Promise。
     */
    public async close(): Promise<void> {
        if (this.client) {
            const [error, _] = await to(this.client.close());
            if (error) {
                throw new Error('MongoDB连接关闭失败');
            }
            this.client = null;
            this.db = null;
            console.log('MongoDB连接已关闭');
        }
    }
}

export { MongodbConnection };