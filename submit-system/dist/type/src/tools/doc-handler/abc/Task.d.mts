import { DocHandler } from '../../DocHandler.mjs';
import { TaskType } from '../TaskFactory.mjs';
declare abstract class Task {
    protected task: DocHandler;
    taskType: TaskType;
    constructor(task: DocHandler, taskType: TaskType);
    abstract handle(): void;
}
export { Task };
//# sourceMappingURL=Task.d.mts.map