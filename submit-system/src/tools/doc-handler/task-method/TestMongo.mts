/*
 * @LastEditTime: 2024/02/07
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

/**
 * TestMongo 类用于检查是否和mongo库的连接关闭了。
 */
class TestMongo {
    /**
     * 检查是否包含除了 meta 之外的其他数据。
     * @param Doc - DocTransactionHandler 类的实例，用于处理文档事务。
     * @returns Promise<void> - 返回一个 Promise，当 Promise 完成时，表示检查操作已经完成。
     */
    public async testMongo(Doc: DocTransactionHandler): Promise<void> {
        const [error, result] = await to(Doc.sgSplitCol.find({}).limit(1).toArray())
        if (error) {
            throw Error(`数据库连接已关闭`);
        }
        console.log(result)
    }
}

export { TestMongo };