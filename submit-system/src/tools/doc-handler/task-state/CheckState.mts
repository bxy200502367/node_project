/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { Task } from '../abc/Task.mjs'
import { TaskType } from '../TaskFactory.mjs'

class CheckState extends Task {
    /**
     * 处理任务
     */
    public async handle() {
        this.task.logger.info(`任务 ${this.task.taskSn} 开始进行拆分信息检查`);
        await this.check();
    }

    /**
     * 检查任务状态
     */
    private async check() {
        // 检查函数要返回为true
        const checks = [
            this.task.extraMethods.hasParams.hasParams,
            this.task.extraMethods.checkLibraryIndex.checkLibraryIndex,
            this.task.extraMethods.checkSpecimenBarcode.checkSpecimenBarcode,
            this.task.extraMethods.checkParallelBclPath.checkParallelBclPath,
            this.task.extraMethods.checkSeqModel.checkSeqModel
        ];

        const checkStatus = [
            this.task.extraProps.checkParamsStatus,
            this.task.extraProps.checkLibraryStatus,
            this.task.extraProps.checkSpecimenStatus,
            this.task.extraProps.checkBclPathStatus,
            this.task.extraProps.checkSeqModelStatus
        ];

        for (let i = 0; i < checks.length; i++) {
            if (checkStatus[i]) {
                continue;
            }
            const [error, status] = await to(checks[i](this.task));
            if (error) {
                this.task.logger.warn(`任务 ${this.task.taskSn} 的检查函数有问题: ${error}`)
                this.task.currentState = this.task.taskFactory.createTask(TaskType.FailedProcessedState);
            }
            if (!status) {
                this.task.currentState = this.task.taskFactory.createTask(TaskType.WaitProcessedState);
                return;
            }
        }
        this.task.currentState = this.task.taskFactory.createTask(TaskType.SuccessProcessedState);
    }
}

export { CheckState }