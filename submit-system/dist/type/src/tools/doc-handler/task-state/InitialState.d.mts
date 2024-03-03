import { Task } from '../abc/Task.mjs';
declare class InitialState extends Task {
    private taskStatus;
    private taskMessage;
    handle(): Promise<void>;
    private updateTaskStatus;
    private handleLibrarySplitStatus;
    private handleSampleSplitStatus;
    private handleSampleQcStatus;
    private setTaskState;
}
export { InitialState };
//# sourceMappingURL=InitialState.d.mts.map