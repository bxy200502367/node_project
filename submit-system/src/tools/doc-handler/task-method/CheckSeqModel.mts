/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */
import * as path from 'path';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

/**
 * CheckSeqModel 类用于检查测序模式
 */
class CheckSeqModel {
    /**
     * 检查测序模式
     * @param Doc - DocTransactionHandler 对象
     * @returns Promise<boolean> - 返回一个 Promise，其解析值为布尔值，表示检查是否通过
     */
    public async checkSeqModel(Doc: DocTransactionHandler): Promise<boolean> {
        let desc: string;
        const librarySplit = Doc.params["library_split"];

        for (let lane in librarySplit) {
            const { split_path: bclPath, seq_model: seqModel } = librarySplit[lane];

            if (!bclPath) {
                desc = `任务 ${Doc.taskSn} 的split_path为空,请检查,重新配置split_path`;
                const [error, _] = await to(Doc.updateInfoFuction(desc, "configure", { "split_check.check_seq_model": false }));
                if (error) {
                    throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
                }
                return false;
            }

            const runInfoFile = path.join(bclPath, "RunInfo.xml");
            const result = CheckSeqModel.parseSeqModel(seqModel);
            const [error, tree] = await to(xml2js.parseStringPromise(fs.readFileSync(runInfoFile)));

            if (error) {
                throw Error(`任务 ${Doc.taskSn} 解析xml文件失败: ${error.message}`)
            }

            const reads = tree.RunInfo.Run[0].Reads[0].Read as Array<{ $: { NumCycles: string } }>;
            const numCycles = reads.map(read => read.$.NumCycles).join(",");

            if (result === numCycles) {
                desc = `任务 ${Doc.taskSn} 的测序模式 ${seqModel} 和RunInfo.xml里的一致,检查通过`;
                const [error, _] = await to(Doc.updateInfoFuction(desc, null));
                if (error) {
                    throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
                }
            } else {
                desc = `任务 ${Doc.taskSn} 的测序模式 ${seqModel} 有问题，应该为 ${numCycles},请检查,重新配置测序模式`;
                const [error, _] = await to(Doc.updateInfoFuction(desc, "configure", { "split_check.check_seq_model": false }));
                if (error) {
                    throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
                }
                return false;
            }
        }

        desc = `任务 ${Doc.taskSn} 所有路径的测序模式检测通过`
        const [error, _] = await to(Doc.updateInfoFuction(desc, null, { "split_check.check_seq_model": true }));
        if (error) {
            throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
        }
        return true;
    }

    /**
     * 解析输入的测序模式
     * @param seqModel - 测序模式字符串
     * @returns string - 解析后的测序模式
     */
    private static parseSeqModel(seqModel: string): string {
        const result = seqModel.split(",").map(seq => {
            const numbers = seq.match(/\d+/g); // 提取数字
            const total = (numbers ? numbers.reduce((sum, number) => sum + parseInt(number), 0) : 0) // 将找到的所有数字转换为整数并相加
                + (seq.match(/n/g) || []).length; // 加上n的数量
            return total;
        });
        return result.join(",");
    }
}

export { CheckSeqModel };