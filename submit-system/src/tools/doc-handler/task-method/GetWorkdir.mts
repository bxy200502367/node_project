/*
 * @LastEditTime: 2024/02/28
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */
import * as path from 'path';
import * as fs from 'fs';
import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

const WORKDIR_PATHS = [
    "/mnt/clustre/users/sanger-dev/wpm2/workspace",
    "/mnt/dlustre/users/sanger/wpm2/workspace"
];

/**
 * GetWorkdir 类用于获取工作目录
 * 
 * @class GetWorkdir
 */
class GetWorkdir {
    /**
     * 获取文库拆分的工作目录
     * @param Doc - DocTransactionHandler 对象
     * @returns Promise<string> - 返回一个 Promise，其解析值为工作目录的路径
     */
    public async getLibrarySplitWorkdir(Doc: DocTransactionHandler): Promise<string> {
        const [error, result] = await to(GetWorkdir.getWorkdir(Doc, Doc.extraProps.firstSplitTs, Doc.extraProps.firstSplitTaskId, 'LibrarySplit'));
        if (error) {
            throw Error(`任务 ${Doc.taskSn} 获取文库拆分工作目录失败: ${error.message}`);
        }
        return result;
    }

    /**
     * 获取样本拆分的工作目录
     * @param Doc - DocTransactionHandler 对象
     * @returns Promise<string> - 返回一个 Promise，其解析值为工作目录的路径
     */
    public async getSampleSplitWorkdir(Doc: DocTransactionHandler): Promise<string> {
        const [error, result] = await to(GetWorkdir.getWorkdir(Doc, Doc.extraProps.secondSplitTs, Doc.extraProps.secondSplitTaskId, 'SampleSplit'));
        if (error) {
            throw Error(`任务 ${Doc.taskSn} 获取样本拆分工作目录失败: ${error.message}`);
        }
        return result;
    }

    /**
     * 获取样本质控的工作目录
     * @param Doc - DocTransactionHandler 对象
     * @returns Promise<string> - 返回一个 Promise，其解析值为工作目录的路径
     */
    public async getSampleQcWorkdir(Doc: DocTransactionHandler): Promise<string> {
        const [error, result] = await to(GetWorkdir.getWorkdir(Doc, Doc.extraProps.qcTs, Doc.extraProps.qcTaskId, 'SampleQc'));
        if (error) {
            throw Error(`任务 ${Doc.taskSn} 获取样本质控工作目录失败: ${error.message}`);
        }
        return result;
    }

    /**
     * 获得工作目录
     * @param Doc - DocTransactionHandler 对象
     * @param ts - 时间戳
     * @param taskId - 任务 ID
     * @param workdirType - 工作目录类型
     * @returns Promise<string> - 返回一个 Promise，其解析值为工作目录的路径
     */
    private static async getWorkdir(Doc: DocTransactionHandler, ts: string | undefined, taskId: string | undefined, workdirType: string): Promise<string> {
        if (ts && taskId) {
            const splitData = GetWorkdir.getSplitData(ts);
            const split = `${workdirType}_${taskId}`;
            const promises = WORKDIR_PATHS.map(workdirPath => GetWorkdir.checkWorkdirPath(Doc, path.join(workdirPath, splitData, split), workdirType));
            const results = await Promise.allSettled(promises);
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    return result.value;
                }
            }
        }
        throw new Error(`工作目录不在本地路径或者在数据库中存储有误`)
    }

    /**
     * 获取分割数据
     * @param ts - 时间戳
     * @returns string - 分割后的数据
     */
    private static getSplitData(ts: string): string {
        return ts.slice(0, 10).replace(/-/g, '');
    }

    /**
     * 检查工作目录路径
     * @param Doc - DocTransactionHandler 对象
     * @param workdirPath - 工作目录路径
     * @param workdirType - 工作目录类型
     * @returns Promise<string | null> - 返回一个 Promise，其解析值为工作目录路径或 null
     */
    private static async checkWorkdirPath(Doc: DocTransactionHandler, workdirPath: string, workdirType: string): Promise<string | null> {
        if (fs.existsSync(workdirPath)) {
            const [error, _] = await to(Doc.sgSplitCol.updateOne(Doc.queryMain, { $set: { [`split_workdir.${workdirType}`]: workdirPath } }));
            if (error) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
            }
            return workdirPath;
        }
        throw new Error(`任务 ${Doc.taskSn} 的工作目录 ${workdirPath} 在本地路径不存在`)
    }
}

export { GetWorkdir };