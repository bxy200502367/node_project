/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import { Task } from '../abc/Task.mjs'
import { TaskType } from '../TaskFactory.mjs'

/**
 * InitialState 类，表示任务的初始状态。
 * 它继承自 Task 类，并提供了处理任务状态的方法。
 */
class InitialState extends Task {
    private taskStatus: TaskType = TaskType.UnknownState;
    private taskMessage: string = `任务 ${this.task.taskSn} 处于未被定义的状态`;

    /**
     * 处理任务状态。
     * 根据任务的额外属性，确定并设置任务的当前状态。
     */
    public async handle(): Promise<void> {
        this.task.logger.info(`任务 ${this.task.taskSn} 开始处理`);
        await this.updateTaskStatus();
    }

    /**
     * 更新任务状态。
     * 根据任务的额外属性检查状态，并设置相应的任务状态和消息。
     * @returns {Promise<void>} 更新操作的Promise。
     */
    private async updateTaskStatus(): Promise<void> {
        const { checkLibraryStatus, checkSpecimenStatus, checkSeqModelStatus, checkBclPathStatus } = this.task.extraProps;

        if (!checkLibraryStatus || !checkSpecimenStatus || !checkSeqModelStatus || !checkBclPathStatus) {
            this.taskStatus = TaskType.CheckState;
            this.taskMessage = `任务 ${this.task.taskSn} 开始尝试拆分信息检查`;
        } else {
            await this.handleLibrarySplitStatus();
        }

        this.setTaskState(this.taskStatus, this.taskMessage);
    }

    /**
     * 处理文库拆分状态。
     * 根据任务的额外属性，确定并设置文库拆分的状态。
     * @returns {Promise<void>} 更新操作的Promise。
     */
    private async handleLibrarySplitStatus(): Promise<void> {
        const firstSplitStatus = this.task.extraProps.firstSplitStatus;

        switch (firstSplitStatus) {
            case 'no':
                this.taskStatus = TaskType.LibrarySplitDeliverState;
                this.taskMessage = `任务 ${this.task.taskSn} 开始尝试文库拆分投递`;
                break;
            case 'start':
                this.taskStatus = TaskType.LibrarySplitRunningState;
                this.taskMessage = `任务 ${this.task.taskSn} 在文库拆分中`;
                break;
            case 'end':
            case '--':
                await this.handleSampleSplitStatus();
                break;
        }
    }


    /**
     * 处理样本拆分状态。
     * 根据任务的额外属性，确定并设置样本拆分的状态。
     * @returns {Promise<void>} 更新操作的Promise。
     */
    private async handleSampleSplitStatus(): Promise<void> {
        const secondSplitStatus = this.task.extraProps.secondSplitStatus;

        switch (secondSplitStatus) {
            case 'no':
                this.taskStatus = TaskType.SampleSplitDeliverState;
                this.taskMessage = `任务 ${this.task.taskSn} 开始尝试样本拆分投递`;
                break;
            case 'start':
                this.taskStatus = TaskType.SampleSplitRunningState;
                this.taskMessage = `任务 ${this.task.taskSn} 在样本拆分中`;
                break;
            case 'end':
                await this.handleSampleQcStatus();
                break;
        }
    }

    /**
     * 处理样本质控状态。
     * 根据任务的额外属性，确定并设置样本质控的状态。
     * @returns {Promise<void>} 更新操作的Promise。
     */
    private async handleSampleQcStatus(): Promise<void> {
        const qcStatus = this.task.extraProps.qcStatus;

        switch (qcStatus) {
            case 'no':
                this.taskStatus = TaskType.SampleQcDeliverState;
                this.taskMessage = `任务 ${this.task.taskSn} 开始尝试样本质控投递`;
                break;
            case 'start':
                this.taskStatus = TaskType.SampleQcRunningState;
                this.taskMessage = `任务 ${this.task.taskSn} 在样本质控中`;
                break;
        }
    }

    /**
     * 设置任务状态
     * @param status 任务状态
     * @param message 任务消息
     */
    private setTaskState(status: TaskType, message: string) {
        this.task.logger.info(message);
        this.task.currentState = this.task.taskFactory.createTask(status);
    }
}

export { InitialState }