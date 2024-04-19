/*
 * @LastEditTime: 2024/03/25
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

/**
 * HasPureLibrary 类用于检查是否包含纯文库的拆分任务(如果包含一个那么这个任务都是纯文库的任务)。
 */
class HasPureLibrary {
    /**
     * 检查是否包含除了 meta 之外的其他数据。
     * @param Doc - DocTransactionHandler 类的实例，用于处理文档事务。
     * @returns Promise<void> - 返回一个 Promise，当 Promise 完成时，表示检查操作已经完成。
     */
    public async hasPureLibrary(Doc: DocTransactionHandler): Promise<void> {
        if (typeof Doc.extraProps.hasPureLibrary === 'undefined') {
            const query = {
                "split_id": Doc.splitId,
                "pure": "yes"
            };
            const countResult = await to(Doc.sgSplitLibraryCol.countDocuments(query));
            if (countResult[0]) {
                throw Error(`任务 ${Doc.taskSn} 数据库查找失败: ${countResult[0].message}，查询条件：${JSON.stringify(query)}`);
            }
            const hasPureLibrary = countResult[1] > 0;
            const desc = `任务 ${Doc.taskSn} ${hasPureLibrary ? '是' : '不是'}纯文库拆分`;
            const [errorUpdate, _] = await to(Doc.updateInfoFuction(desc, null, { 'split_check.has_pure_library': hasPureLibrary }));
            if (errorUpdate) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${errorUpdate.message}`);
            }
            Doc.extraProps.hasPureLibrary = hasPureLibrary;
        }
    }
}

export { HasPureLibrary };