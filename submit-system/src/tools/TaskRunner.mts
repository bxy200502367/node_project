/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */
import to from 'await-to-js';
import * as moment from 'moment';
import { MongodbConnection } from './task-manager/MongodbConnection.mjs';
import { LockFileManager } from './task-manager/LockFileManager.mjs';
import { DocHandler } from './DocHandler.mjs'
import { Logger } from '../utils/Logger.mjs'

class TaskRunner {
    private readonly lockFilePath: string;
    private readonly mongodbConnection: MongodbConnection;
    private readonly lockFileManager: LockFileManager;
    private readonly logger: Logger

    constructor(mongoConfigPath: string, lockFilePath: string) {
        this.lockFilePath = lockFilePath;
        this.mongodbConnection = new MongodbConnection({ configPath: mongoConfigPath });
        this.lockFileManager = new LockFileManager(lockFilePath)
        this.logger = new Logger();
    }

    /**
     * 开始运行任务。
     * @returns {Promise<void>} 运行任务的Promise。
     */
    public async run() {
        this.logger.info('==================== 开始新的运行实例 ====================');
        let client;
        try {
            // 检查进程是否已运行
            const processRunningResult = await this.lockFileManager.checkProcessRunning();
            if (processRunningResult) {
                return;
            }

            // 创建锁文件
            const [errorWriteLockFile] = await to(this.lockFileManager.writeLockFile()) ?? null;
            if (errorWriteLockFile) {
                this.logger.warn(`无法创建锁文件 ${this.lockFilePath}: ${errorWriteLockFile.message}`);
                return;
            }

            // 连接MongoDB
            const [error, client] = await to(this.mongodbConnection.connect());
            if (error) {
                this.logger.error(`连接到MongoDB数据库时出错: ${error.message}`);
                return;
            }
            const sgSplitCol = this.mongodbConnection.getCollection("sg_split");
            const sgSplitLibraryCol = this.mongodbConnection.getCollection("sg_split_library")
            const sgSplitSpecimenCol = this.mongodbConnection.getCollection("sg_split_specimen");

            // 查询待处理的任务
            const query = {
                "status": {
                    "$in": ["start", "no"]
                },
                "$or": [
                    { "split_path_source": { "$exists": false } },
                    { "split_path_source": "shanghai" }
                ]
            };

            const [errorFind, result] = await to(sgSplitCol.find(query).toArray());
            if (errorFind) {
                this.logger.warn(`查找要投递的任务失败: ${errorFind.message}`)
                return;
            }
            this.logger.info(`${moment().format("YYYY-MM-DD HH:mm:ss")} 需要处理 ${result.length} 个任务`)

            // 处理每个任务
            const promises = result.map(async (doc) => {
                const docObject = new DocHandler(doc, sgSplitCol, sgSplitLibraryCol, sgSplitSpecimenCol);

                // 初始化DocHandler
                const [errorInit] = await to(docObject.initPromise) ?? null;
                if (errorInit) {
                    this.logger.error(`DocHandler动态方法初始化失败: ${errorInit.message}`)
                    return;
                }

                // 处理任务
                const [errorHandle] = await to(docObject.handle()) ?? null;
                if (errorHandle) {
                    this.logger.error(`doc操作失败: ${errorHandle.message}`)
                }
            });

            // 等待所有任务处理完成
            await Promise.all(promises);
        } finally {
            // 关闭MongoDB连接
            const [errorCloseMongodb] = await to(this.mongodbConnection.close()) ?? null;
            if (errorCloseMongodb) {
                this.logger.warn(errorCloseMongodb.message);
            }

            // 删除锁文件
            const [errorDeleteLockFile] = await to(this.lockFileManager.deleteLockFile()) ?? null;
            if (errorDeleteLockFile) {
                this.logger.warn(errorDeleteLockFile.message);
                return;
            }
        }
    }
}

export { TaskRunner };