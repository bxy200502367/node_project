import { AbstractTaskFactory } from './abc/AbstractTaskFactory.mjs';
import { DocHandler } from '../DocHandler.mjs';
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
type TaskState = InitialState | CheckState | LibrarySplitDeliverState | LibrarySplitRunningState | SampleSplitDeliverState | SampleSplitRunningState | SampleQcDeliverState | SampleQcRunningState | WaitProcessedState | FailedProcessedState | SuccessProcessedState | UnknownState;
declare enum TaskType {
    InitialState = "initalStatus",
    CheckState = "checkStatus",
    LibrarySplitDeliverState = "librarySplitDeliverStatus",
    LibrarySplitRunningState = "librarySplitRunningStatus",
    SampleSplitDeliverState = "sampleSplitDeliverStatus",
    SampleSplitRunningState = "sampleSplitRunningStatus",
    SampleQcDeliverState = "sampleQcDeliverStatus",
    SampleQcRunningState = "sampleQcRunningStatus",
    WaitProcessedState = "waitProcessedStatus",
    FailedProcessedState = "failedProcessedStatus",
    SuccessProcessedState = "successProcessedStatus",
    UnknownState = "unknownStatus"
}
declare class TaskFactory extends AbstractTaskFactory {
    private readonly task;
    private static readonly taskTypeMapping;
    constructor(task: DocHandler);
    createTask(taskType: TaskType): TaskState;
}
export { TaskType, TaskState, TaskFactory };
//# sourceMappingURL=TaskFactory.d.mts.map