import { MongodbConnection } from './task-manager/MongodbConnection.mjs';
import { LockFileManager } from './task-manager/LockFileManager.mjs';
import { Logger } from '../utils/Logger.mjs';
declare class TaskRunner {
    private readonly mongodbConnection;
    private readonly lockFileManager;
    private readonly logger;
    constructor(mongodbConnection: MongodbConnection, lockFileManager: LockFileManager, logger: Logger);
    run(): Promise<void>;
}
export { TaskRunner };
//# sourceMappingURL=TaskRunner.d.mts.map