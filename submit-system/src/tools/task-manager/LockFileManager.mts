import { promises as fs } from 'fs';
import * as os from 'os';

class LockFileManager {
    private readonly lockFilePath: string;

    constructor(lockFilePath: string) {
        this.lockFilePath = lockFilePath;
    }

    /**
     * 创建锁文件，包含当前进程ID和启动时间。
     * @returns {Promise<void>} 创建锁文件的Promise。
     */
    public async writeLockFile(): Promise<void> {
        await fs.writeFile(this.lockFilePath, `PID: ${process.pid}\n启动时间: ${new Date().toISOString()}`);
    }

    /**
     * 检查锁文件和当前进程是否已运行。
     * @returns {Promise<boolean>} 如果锁文件存在且进程存在，返回true；否则删除锁文件并返回false。
     */
    public async checkProcessRunning(): Promise<boolean> {
        try {
            const lockFileContent = await fs.readFile(this.lockFilePath, 'utf-8');
            const pid = Number(lockFileContent.split(os.EOL)[0].split(': ')[1]);

            try {
                process.kill(pid, 0);
                return true; // 进程存在
            } catch (e) {
                console.warn('发现僵尸锁文件，删除并继续');
                await this.deleteLockFile();
                return false; // 进程不存在
            }
        } catch (error) {
            return false; // 锁文件不存在
        }
    }

    /**
     * 删除锁文件。
     * @returns {Promise<void>} 删除锁文件的Promise。
     */
    public async deleteLockFile(): Promise<void> {
        await fs.unlink(this.lockFilePath);
        console.log('锁文件已删除');
    }
}

export { LockFileManager };