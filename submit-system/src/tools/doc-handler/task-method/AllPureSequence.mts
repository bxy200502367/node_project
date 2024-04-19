/*
 * @LastEditTime: 2024/04/01
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

/**
 * AllPureSequence 类用于检查是否都是纯测序,如果都是纯测序那么就存储路径到本地
 */
class AllPureSequence {
    /**
     * 检查是否是否都是纯测序。
     * @param Doc - DocTransactionHandler 类的实例，用于处理文档事务。
     * @returns Promise<void> - 返回一个 Promise，当 Promise 完成时，表示检查和可能的拆分操作已经完成。
     */
    private async countDocuments(Doc: DocTransactionHandler, query: object): Promise<number> {
        const [error, count] = await to(Doc.sgSplitSpecimenCol.countDocuments(query));
        if (error) {
            throw Error(`任务 ${Doc.taskSn} 数据库查找失败: ${error.message}`);
        }
        return count;
    }

    public async allPureSequence(Doc: DocTransactionHandler): Promise<void> {
        if (typeof Doc.extraProps.allPureSequence === 'undefined') {
            const pureSequenceCount = await this.countDocuments(Doc, {
                "split_id": Doc.splitId,
                "analysis_type": "pure_sequence"
            });
            const totalCount = await this.countDocuments(Doc, {
                "split_id": Doc.splitId
            });
            const allPureSequence = pureSequenceCount === totalCount;
            const desc = `任务 ${Doc.taskSn} ${allPureSequence ? '都是' : '不都是'}纯测序样本`;
            const [errorUpdate, _] = await to(Doc.updateInfoFuction(desc, null, { 'split_check.all_pure_sequence': allPureSequence }));
            if (errorUpdate) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${errorUpdate.message}`);
            }
            Doc.extraProps.allPureSequence = allPureSequence
        }
    }
}

export { AllPureSequence }