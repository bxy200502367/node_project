import { TaskState, TaskType } from '../TaskFactory.mjs';
declare abstract class AbstractTaskFactory {
    abstract createTask(taskType: TaskType): TaskState;
}
export { AbstractTaskFactory };
//# sourceMappingURL=AbstractTaskFactory.d.mts.map