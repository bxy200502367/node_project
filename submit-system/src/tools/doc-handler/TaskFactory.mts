/*
 * @LastEditTime: 2024/02/07
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import { AbstractTaskFactory } from './abc/AbstractTaskFactory.mjs';
import { DocHandler } from '../DocHandler.mjs'
import { InitialState } from './task-state/InitialState.mjs';
import { CheckState } from './task-state/CheckState.mjs';
import { LibrarySplitDeliverState } from './task-state/LibrarySplitDeliverState.mjs';
import { LibrarySplitRunningState } from './task-state/LibrarySplitRunningState.mjs';
import { SampleSplitDeliverState } from './task-state/SampleSplitDeliverState.mjs';
import { SampleSplitRunningState } from './task-state/SampleSplitRunningState.mjs';
import { SampleQcDeliverState } from './task-state/SampleQcDeliverState.mjs';
import { SampleQcRunningState } from './task-state/SampleQcRunningState.mjs';
import { WaitProcessedState } from './task-state/WaitProcessedState.mjs';
import { FailedProcessedState } from './task-state/FailedProcessedState.mjs';
import { SuccessProcessedState } from './task-state/SuccessProcessedState.mjs';
import { UnknownState } from './task-state/UnknownState.mjs';

// 任务状态类
type TaskState =
    | InitialState
    | CheckState
    | LibrarySplitDeliverState
    | LibrarySplitRunningState
    | SampleSplitDeliverState
    | SampleSplitRunningState
    | SampleQcDeliverState
    | SampleQcRunningState
    | WaitProcessedState
    | FailedProcessedState
    | SuccessProcessedState
    | UnknownState;

// 定义任务类型的枚举
enum TaskType {
    InitialState = 'initalStatus', // 初始状态
    CheckState = 'checkStatus', // 检查参数状态
    LibrarySplitDeliverState = 'librarySplitDeliverStatus', // library_split投递状态
    LibrarySplitRunningState = 'librarySplitRunningStatus', // library_split运行状态
    SampleSplitDeliverState = 'sampleSplitDeliverStatus', // sample_split投递状态
    SampleSplitRunningState = 'sampleSplitRunningStatus', // sample_split运行状态
    SampleQcDeliverState = 'sampleQcDeliverStatus', // sample_qc投递状态
    SampleQcRunningState = 'sampleQcRunningStatus', // sample_qc运行状态
    WaitProcessedState = 'waitProcessedStatus', // 等待下一次运行状态
    FailedProcessedState = 'failedProcessedStatus', // 处理失败状态
    SuccessProcessedState = 'successProcessedStatus', // 处理成功状态
    UnknownState = 'unknownStatus' // 未知状态
}

/**
 * TaskFactory类，继承自AbstractTaskFactory。
 * 用于根据任务类型创建不同的任务实例。
 */
class TaskFactory extends AbstractTaskFactory {
    private readonly task: DocHandler;
    private static readonly taskTypeMapping: { [key in TaskType]: new (task: DocHandler, taskType: TaskType) => TaskState } = {
        [TaskType.InitialState]: InitialState,
        [TaskType.CheckState]: CheckState,
        [TaskType.LibrarySplitDeliverState]: LibrarySplitDeliverState,
        [TaskType.LibrarySplitRunningState]: LibrarySplitRunningState,
        [TaskType.SampleSplitDeliverState]: SampleSplitDeliverState,
        [TaskType.SampleSplitRunningState]: SampleSplitRunningState,
        [TaskType.SampleQcDeliverState]: SampleQcDeliverState,
        [TaskType.SampleQcRunningState]: SampleQcRunningState,
        [TaskType.WaitProcessedState]: WaitProcessedState,
        [TaskType.FailedProcessedState]: FailedProcessedState,
        [TaskType.SuccessProcessedState]: SuccessProcessedState,
        [TaskType.UnknownState]: UnknownState
    };

    constructor(task: DocHandler) {
        super();
        this.task = task;
    }

    /**
     * 创建任务的方法。
     * @param {TaskType} taskType - 任务类型。
     * @return {TaskState} 根据任务类型创建的任务实例。
     * @throws {Error} 当任务类型未知时抛出错误。
     */

    public createTask(taskType: TaskType): TaskState {
        const TaskTypeClass = TaskFactory.taskTypeMapping[taskType] || UnknownState;
        return new TaskTypeClass(this.task, taskType);
    }
}

export { TaskType, TaskState, TaskFactory };