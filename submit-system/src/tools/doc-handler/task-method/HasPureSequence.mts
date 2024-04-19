/*
 * @LastEditTime: 2024/04/01
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

/**
 * HasPureSequence 类用于检查样本中是否存在纯测序样本
 */
class HasPureSequence {
    /**
     * 检查是否是否都是纯测序。
     * @param Doc - DocTransactionHandler 类的实例，用于处理文档事务。
     * @returns Promise<void> - 返回一个 Promise，当 Promise 完成时，表示检查和可能的拆分操作已经完成。
     */
    public async hasPureSequence(Doc: DocTransactionHandler): Promise<void> {
        if (typeof Doc.extraProps.hasPureSequence === 'undefined') {
            const query = {
                "split_id": Doc.splitId,
                "analysis_type": "pure_sequence"
            };
            const [error, count] = await to(Doc.sgSplitSpecimenCol.countDocuments(query));
            if (error) {
                throw Error(`任务 ${Doc.taskSn} 数据库查找失败: ${error.message}`);
            }
            const hasPureSequence = count > 0;
            const desc = `任务 ${Doc.taskSn} ${hasPureSequence ? '包含' : '不包含'}纯测序样本`;
            const [errorUpdate, _] = await to(Doc.updateInfoFuction(desc, null, { 'split_check.has_pure_sequence': hasPureSequence }));
            if (errorUpdate) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${errorUpdate.message}`);
            }
            Doc.extraProps.hasPureSequence = hasPureSequence
        }
    }
}

export { HasPureSequence }