/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { Task } from '../abc/Task.mjs'
import { TaskType } from '../TaskFactory.mjs'


class LibrarySplitRunningState extends Task {
    /**
     * 处理任务的文库拆分工作目录的更新
     */
    public async handle() {
        const taskSn = this.task.taskSn;
        const taskFactory = this.task.taskFactory;
        if (this.task.extraProps.firstSplitWorkdir) {
            this.task.logger.info(`任务 ${taskSn} 的文库拆分工作目录已经更新过了！`)
            this.task.currentState = taskFactory.createTask(TaskType.SuccessProcessedState);
            this.task.logger.info(`任务 ${taskSn} 的文库拆分工作目录为 ${this.task.extraProps.firstSplitWorkdir}`)
        } else {
            this.task.logger.info(`任务 ${taskSn} 开始更新文库拆分工作目录！`)
            const [error, librarySplitWorkdir] = await to(this.task.extraMethods.getWorkdir.getLibrarySplitWorkdir(this.task));
            if (error) {
                this.task.logger.error(`任务 ${taskSn} 获取文库拆分工作目录失败 ${error.message}`);
                this.task.currentState = taskFactory.createTask(TaskType.WaitProcessedState);
            } else {
                this.task.logger.info(`任务 ${taskSn} 的文库拆分工作目录为 ${librarySplitWorkdir}`);
                this.task.currentState = taskFactory.createTask(TaskType.SuccessProcessedState);
            }
        }
    }
}

export { LibrarySplitRunningState }