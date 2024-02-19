/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */


import { Task } from '../abc/Task.mjs'

/**
 * WaitProcessedState 类
 * 这个类继承了 Task 类，并实现了 handle 方法
 * handle 方法用于处理任务结束后的等待或重新配置信息
 */
class WaitProcessedState extends Task {
    public async handle() {
        this.task.logger.info(`任务 ${this.task.taskSn} 处理结束, 继续等待或者重新配置信息`);
    }
}

export { WaitProcessedState }