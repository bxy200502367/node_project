/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */
import to from 'await-to-js';
import { Doc, DocTransactionHandler } from './doc-handler/DocTransactionHandler.mjs';
import { TaskType, TaskState, TaskFactory } from './doc-handler/TaskFactory.mjs';
import { Collection } from 'mongodb';

/**
 * DocHandler 类，用于处理文档的状态
 * 继承自 DocTransactionHandler 类
 */
class DocHandler extends DocTransactionHandler {
    public taskFactory: TaskFactory;
    private _currentState: TaskState;

    /**
     * 构造函数，初始化 DocHandler
     */
    constructor(doc: Doc, sgSplitCol: Collection<Doc>, sgSplitLibraryCol: Collection<Doc>, sgSplitSpecimenCol: Collection<Doc>) {
        super(doc, sgSplitCol, sgSplitLibraryCol, sgSplitSpecimenCol);
        this.taskFactory = new TaskFactory(this);
        this._currentState = this.taskFactory.createTask(TaskType.InitialState);
    }

    /**
     * 获取当前状态
     */
    public get currentState(): TaskState {
        return this._currentState;
    }

    /**
     * 设置当前状态
     */
    public set currentState(newState: TaskState) {
        this._currentState = newState;
    }

    /**
     * 处理当前状态，如果当前状态不是终止状态，则继续处理
     * 如果处理过程中出现错误，则将当前状态设置为失败状态，并抛出错误
     */
    public async handle(): Promise<void> {
        while (!this.isTerminateStatus()) {
            const [error, _] = await to(this.handleCurrentState());
            if (error) {
                this.currentState = this.taskFactory.createTask(TaskType.FailedProcessedState);
                throw error;
            }
        }
        if (this.isTerminateStatus()) {
            const [error, _] = await to(this.handleCurrentState());
            if (error) {
                this.currentState = this.taskFactory.createTask(TaskType.FailedProcessedState);
                throw error;
            }
        }
    }

    /**
     * 处理当前状态，并处理可能的错误
     * 如果处理过程中出现错误，则将当前状态设置为失败状态，并抛出错误
     */
    private async handleCurrentState(): Promise<void> {
        const [error, _] = await to(this.currentState.handle());
        if (error) {
            this.currentState = this.taskFactory.createTask(TaskType.FailedProcessedState);
            throw error;
        }
    }

    /**
     * 判断当前状态是否是终止状态
     * @returns 当前状态是否是终止状态
     */
    public isTerminateStatus(): boolean {
        const terminateStates = [
            TaskType.WaitProcessedState,
            TaskType.FailedProcessedState,
            TaskType.SuccessProcessedState
        ];
        return terminateStates.includes(this.currentState.taskType as TaskType);
    }
}

export { DocHandler };