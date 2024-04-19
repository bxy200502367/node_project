/*
 * @LastEditTime: 2024/04/03
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { Task } from '../abc/Task.mjs'
import { TaskType } from '../TaskFactory.mjs'

/**
 * UploadDataRunningState 类
 * 这个类继承了 Task 类，并实现了 handle 方法
 * handle 方法用于处理任务的样本上传工作目录的更新
 */
class UploadDataRunningState extends Task {
    public async handle() {
        const taskSn = this.task.taskSn;
        const taskFactory = this.task.taskFactory;
        if (this.task.extraProps.uplodDataWorkdir) {
            this.task.logger.info(`任务 ${taskSn} 的样本上传工作目录已经更新过了！`)
            this.task.currentState = taskFactory.createTask(TaskType.SuccessProcessedState);
            this.task.logger.info(`任务 ${taskSn} 的样本上传工作目录为 ${this.task.extraProps.uplodDataWorkdir}`)
        } else {
            this.task.logger.info(`任务 ${taskSn} 开始更新样本上传工作目录！`)
            const [error, uplodDataWorkdir] = await to(this.task.extraMethods.getWorkdir.getUploadDataWorkdir(this.task));
            if (error) {
                this.task.logger.warn(`任务 ${taskSn} 获取样本上传工作目录失败 ${error.message}`);
                this.task.currentState = taskFactory.createTask(TaskType.WaitProcessedState);
            } else {
                this.task.logger.info(`任务 ${taskSn} 的样本上传工作目录为 ${uplodDataWorkdir}`);
                this.task.currentState = taskFactory.createTask(TaskType.SuccessProcessedState);
            }
        }
    }
}
export { UploadDataRunningState };