/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */


import { Task } from '../abc/Task.mjs'

/**
 * FailedProcessedState 类
 * 这个类继承了 Task 类，并实现了 handle 方法
 * handle 方法用于处理任务成功后的操作
 */
class SuccessProcessedState extends Task {
    public async handle() {
        this.task.logger.info(`任务 ${this.task.taskSn} 处理结束, 处理结果符合预期并正确运行中`);
    }
}

export { SuccessProcessedState }