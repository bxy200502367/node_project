/*
 * @LastEditTime: 2024/02/07
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

/**
 * HasMeta 类用于检查是否包含 meta 数据，如果包含则需要进行样本拆分。
 */
class HasMeta {
    /**
     * 检查是否包含 meta 数据，如果包含则需要进行样本拆分。
     * @param Doc - DocTransactionHandler 类的实例，用于处理文档事务。
     * @returns Promise<void> - 返回一个 Promise，当 Promise 完成时，表示检查和可能的拆分操作已经完成。
     */
    public async hasMeta(Doc: DocTransactionHandler): Promise<void> {
        if (typeof Doc.extraProps.hasMeta === 'undefined') {
            const query = {
                "split_id": Doc.splitId,
                "product_type": "meta"
            };
            const [error, count] = await to(Doc.sgSplitSpecimenCol.countDocuments(query));
            if (error) {
                throw Error(`任务 ${Doc.taskSn} 数据库查找失败: ${error.message}`);
            }
            const hasMeta = count > 0;
            const desc = `任务 ${Doc.taskSn} ${hasMeta ? '需要' : '不需要'}进行样本拆分`;
            const [errorUpdate, _] = await to(Doc.updateInfoFuction(desc, null, { 'split_check.has_meta': hasMeta }));
            if (errorUpdate) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${errorUpdate.message}`);
            }
            Doc.extraProps.hasMeta = hasMeta
        }
    }
}

export { HasMeta }