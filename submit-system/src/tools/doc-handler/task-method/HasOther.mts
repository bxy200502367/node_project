/*
 * @LastEditTime: 2024/02/07
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

/**
 * HasOther 类用于检查是否包含 非meta 数据，如果包含则需要进行样本质控。
 */
class HasOther {
    /**
     * 检查是否包含除了 meta 之外的其他数据。
     * @param Doc - DocTransactionHandler 类的实例，用于处理文档事务。
     * @returns Promise<void> - 返回一个 Promise，当 Promise 完成时，表示检查操作已经完成。
     */
    public async hasOther(Doc: DocTransactionHandler): Promise<void> {
        if (typeof Doc.extraProps.hasOther === 'undefined') {
            const query = {
                "split_id": Doc.splitId,
                "product_type": { $ne: "meta" }
            };
            const [error, count] = await to(Doc.sgSplitSpecimenCol.countDocuments(query));
            if (error) {
                throw Error(`任务 ${Doc.taskSn} 数据库查找失败: ${error.message}`);
            }
            const hasOther = count > 0;
            const desc = `任务 ${Doc.taskSn} ${hasOther ? '需要' : '不需要'}进行样本质控`;
            const [errorUpdate, _] = await to(Doc.updateInfoFuction(desc, null, { 'split_check.has_other': hasOther }));
            if (errorUpdate) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${errorUpdate.message}`);
            }
            Doc.extraProps.hasOther = hasOther;
        }
    }
}

export { HasOther };