/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */
import * as path from 'path';
import * as fs from 'fs';
import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

interface CheckResult {
    pathInvalid: boolean;
    desc: string;
}

/**
 * CheckParallelBclPath 类用于检查多个 lane 的 split_path。
 */
class CheckParallelBclPath {
    /**
     * 检查多个lane的split_path
     * @param Doc - DocTransactionHandler 对象
     * @returns Promise<boolean> - 返回一个 Promise，其解析值为布尔值，表示检查是否通过
     */
    public async checkParallelBclPath(Doc: DocTransactionHandler): Promise<boolean> {
        const librarySplit = Doc.params["library_split"];

        for (let lane in librarySplit) {
            const bclPath = librarySplit[lane]["split_path"]
            const { pathInvalid, desc } = CheckParallelBclPath.checkBclPath(Doc, bclPath)
            const [error, _] = await to(Doc.updateInfoFuction(desc));
            if (error) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
            }
            Doc.logger.info(`本次投递的任务 ${Doc.taskSn} 的split_path为 ${bclPath}`);
            Doc.logger.info(`本次投递的任务 ${Doc.taskSn} 的desc为 ${desc}`);
            if (pathInvalid) {
                return false;
            }
        }
        const desc = `任务 ${Doc.taskSn} 所有路径的bcl文件传输完整,可以开始启动拆分`
        const [error, _] = await to(Doc.updateInfoFuction(desc, null, { 'split_check.check_bcl_path': true }));
        if (error) {
            throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
        }
        return true;
    }

    /**
     * 如果包含params则检查bcl文件传输情况
     * IndexMetricsOut.bin文件权限和其他不一样，对于其他用户没有写权限；如果有两个用户就会有问题
     * @param Doc - DocTransactionHandler 对象
     * @param bclPath - BCL 文件路径
     * @returns CheckResult - 检查结果
     */
    private static checkBclPath(Doc: DocTransactionHandler, bclPath: string): CheckResult {
        let pathInvalid = false;
        let desc = '';

        const rtaCompleteFile = path.join(bclPath, "RTAComplete.txt");
        const runInfoFile = path.join(bclPath, "RunInfo.xml");
        const configFile = path.join(bclPath, "Data/Intensities/config.xml");
        const sLocsFile = path.join(bclPath, "Data/Intensities/s.locs");
        const eventFile = path.join(bclPath, "InterOp/EventMetricsOut.bin");
        const IndexMetricsOutFile = path.join(bclPath, "InterOp/IndexMetricsOut.bin")

        if (!bclPath) {
            pathInvalid = true;
            desc = "参数里缺少下机数据路径,请检查";
        } else if (!fs.existsSync(bclPath)) {
            pathInvalid = true;
            desc = `下机数据路径: ${bclPath} 不存在,请检查`;
        } else if (!fs.existsSync(rtaCompleteFile)) {
            pathInvalid = true;
            desc = `缺少RTAComplete.txt文件: ${rtaCompleteFile} ,可能数据还没完全下机，请检查`;
        } else if (!fs.existsSync(runInfoFile)) {
            pathInvalid = true;
            desc = `缺少RunInfo.xml文件: ${runInfoFile} ,请检查`;
        } else if (!fs.existsSync(configFile) && !fs.existsSync(sLocsFile)) {
            pathInvalid = true;
            desc = `缺少s.locs/config.xml文件: ${sLocsFile} / ${configFile},请检查`;
        } else if (!fs.existsSync(eventFile)) {
            pathInvalid = true;
            desc = `缺少EventMetricsOut.bin文件: ${eventFile} ,请检查`;
        } else {
            if (fs.existsSync(IndexMetricsOutFile)) {
                try {
                    fs.accessSync(IndexMetricsOutFile, fs.constants.W_OK);
                    fs.chmodSync(IndexMetricsOutFile, 0o764);
                    Doc.logger.info(`${IndexMetricsOutFile} 文件的权限修改成功`);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        Doc.logger.error(`无法修改文件 ${IndexMetricsOutFile} 的权限: ${err.message}`);
                    } else {
                        Doc.logger.error(`无法修改文件 ${IndexMetricsOutFile} 的权限: ${err}`);
                    }
                }
            }
            pathInvalid = false;
            desc = "bcl文件传输完整,可以开始启动拆分";
        }

        return { pathInvalid, desc };
    }

}

export { CheckParallelBclPath };