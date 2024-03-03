/*
 * @LastEditTime: 2024/03/02
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */
import to from 'await-to-js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { TaskRunner } from "./src/tools/TaskRunner.mjs";
import { Logger } from './src/utils/Logger.mjs'
import { MongodbConnection } from './src/tools/task-manager/MongodbConnection.mjs';
import { LockFileManager } from './src/tools/task-manager/LockFileManager.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mongoConfigPath = path.join(__dirname, './src/config/mongoConfig.json');
const lockFilePath = path.join(__dirname, './lock');
const configFilePath = path.join(__dirname, './src/config/loggingConfig.json')

const mongodbConnection = new MongodbConnection({ configPath: mongoConfigPath });
const lockFileManager = new LockFileManager(lockFilePath)
const logger = new Logger(configFilePath);

// 创建TaskRunner实例
const taskRunner = new TaskRunner(mongodbConnection, lockFileManager, logger);

async function main() {
    // 运行任务
    const [error] = await to(taskRunner.run()) ?? null;
    if (error) {
        logger.error(`执行任务时出错: ${error.message}`);
    }
    logger.info('任务执行完成');
}

// 每两分钟运行一次main函数
setInterval(main, 2 * 60 * 1000);

// import { Logger } from './src/utils/Logger.mjs'

// (() => {
//     const logger = new Logger();
//     // 测试信息级别日志
//     logger.info('This is an info message');
//     // 测试警告级别日志
//     logger.warn('This is a warning message');
//     // 测试错误级别日志
//     try {
//         throw new Error('Test error');
//     } catch (error: any) {
//         logger.error(`测试`);
//     }
// })();