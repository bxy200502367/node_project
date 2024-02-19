/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */
import to from 'await-to-js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { TaskRunner } from "./src/tools/TaskRunner.mjs";
import { Logger } from './src/utils/Logger.mjs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function main() {
    const logger = new Logger();
    const mongoConfigPath = path.join(__dirname, './src/config/mongoConfig.json');
    const lockFilePath = path.join(__dirname, './lock');

    // 创建TaskRunner实例
    const taskRunner = new TaskRunner(mongoConfigPath, lockFilePath);

    // 运行任务
    const [error] = await to(taskRunner.run()) ?? null;
    if (error) {
        logger.error(`执行任务时出错: ${error.message}`);
    }
    logger.info('任务执行完成');
}

// 直接运行main函数
main();

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