import { Doc, DocTransactionHandler } from './doc-handler/DocTransactionHandler.mjs';
import { TaskState, TaskFactory } from './doc-handler/TaskFactory.mjs';
import { Collection } from 'mongodb';
declare class DocHandler extends DocTransactionHandler {
    taskFactory: TaskFactory;
    private _currentState;
    constructor(doc: Doc, sgSplitCol: Collection<Doc>, sgSplitLibraryCol: Collection<Doc>, sgSplitSpecimenCol: Collection<Doc>);
    get currentState(): TaskState;
    set currentState(newState: TaskState);
    handle(): Promise<void>;
    private handleCurrentState;
    isTerminateStatus(): boolean;
}
export { DocHandler };
//# sourceMappingURL=DocHandler.d.mts.map