/*
 * @LastEditTime: 2024/02/07
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

/**
 * HasParams 类用于检查任务是否包含params字段。
 */
class HasParams {
    /**
     * 检查任务是否包含params字段。
     * @param docTransactionHandler - DocTransactionHandler 类的实例，用于处理文档事务。
     * @returns Promise<boolean> - 返回一个 Promise，当 Promise 完成时，表示检查操作已经完成。
     */
    public async hasParams(Doc: DocTransactionHandler): Promise<boolean> {
        let desc;
        if (Doc.hasField("params")) {
            desc = `任务 ${Doc.taskSn} 的params存在`;
            const [errorUpdate, _] = await to(Doc.updateInfoFuction(desc, null, { "split_check.check_params": true }));
            if (errorUpdate) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${errorUpdate.message}`);
            }
            return true;
        } else {
            desc = `任务 ${Doc.taskSn} 的params不存在;请检查,重新设置params`;
            const [errorUpdate, _] = await to(Doc.updateInfoFuction(desc, "configure", { "split_check.check_params": false }));
            if (errorUpdate) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${errorUpdate.message}`);
            }
            return false;
        }
    }
}

export { HasParams };