declare class LockFileManager {
    readonly lockFilePath: string;
    constructor(lockFilePath: string);
    writeLockFile(): Promise<void>;
    checkProcessRunning(): Promise<boolean>;
    deleteLockFile(): Promise<void>;
}
export { LockFileManager };
//# sourceMappingURL=LockFileManager.d.mts.map