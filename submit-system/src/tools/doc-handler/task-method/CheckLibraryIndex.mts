/*
 * @LastEditTime: 2024/03/11
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import { Doc, DocTransactionHandler } from "../DocTransactionHandler.mjs";

interface LaneIndexInfo {
    [key: string]: [string, string, string][];
}

/**
 * CheckLibraryIndex 类用于检查文库索引。
 */
class CheckLibraryIndex {
    /**
     * 检查文库索引。
     * @param Doc - DocTransactionHandler 类的实例，用于处理文档事务。
     * @returns Promise<boolean> - 返回一个 Promise，当 Promise 完成时，表示检查操作已经完成。
     */
    public async checkLibraryIndex(Doc: DocTransactionHandler): Promise<boolean> {
        const laneIndexInfo: LaneIndexInfo = {};
        const query = {
            "split_id": Doc.splitId
        };
        const [error, result] = await to(Doc.sgSplitLibraryCol.find(query).toArray());
        if (error) {
            throw Error(`任务 ${Doc.taskSn} 数据库查找失败: ${error.message}`)
        }
        result.forEach((doc: Doc) => {
            const {
                lane_name: laneName = "",
                library_number: libraryNumber = "",
                i7_index_id: i7IndexId = "",
                i7_index_seq: i7IndexSeq = "",
                i5_index_seq: i5IndexSeq = ""
            } = doc;
            const indexSeq = `${i7IndexSeq}--${i5IndexSeq}`;
            if (!laneIndexInfo[laneName]) {
                laneIndexInfo[laneName] = [];
            }
            laneIndexInfo[laneName].push([i7IndexId, indexSeq, libraryNumber]);
        })
        const [isDuplicate, duplicateType, duplicateValue, laneName, libraryNumber] = CheckLibraryIndex.checkDuplicateI7IndexIdAndIndexSeqSeparately(laneIndexInfo);
        let desc;
        if (isDuplicate) {
            desc = `任务 ${Doc.taskSn} 的 lane ${laneName} 文库 ${libraryNumber} 的 ${duplicateType} 重复,重复的 ${duplicateType} 为 ${duplicateValue};请检查,重新配置index`;
            const [error, _] = await to(Doc.updateInfoFuction(desc, "configure", { "split_check.check_library": false }));
            if (error) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
            }
        } else {
            desc = `任务 ${Doc.taskSn} 的文库index检查通过`;
            const [error, _] = await to(Doc.updateInfoFuction(desc, null, { "split_check.check_library": true }));
            if (error) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
            }
        }
        return !isDuplicate;
    }

    /**
     * 使用正则表达式来检查 seq 序列。
     * @param options - 一个包含 seq 和 type 的对象。
     * @returns boolean - 如果 seq 检查通过，返回 true，否则返回 false。
     */
    private static isValid({ seq, type = "seq" }: { seq: string, type?: string }): boolean {
        const regexMap: { [key: string]: RegExp } = {
            'seq': /^[ATCG-]*$/,
            'name': /^[a-zA-Z0-9_-]*$/
        };
        const regex = regexMap[type];
        if (!regex) {
            throw new Error(`未知的类型: ${type}`);
        }
        return regex.test(seq);
    }

    /**
     * 检查i7_index_id 和 index_seq 字段是否分别存在重复
     * 可以使用 Set 而不是 Object 来存储 i7IndexId 和 indexSeq，因为 Set 的查找速度比 Object 快
     * @param laneIndexInfo - 需要检查的信息。
     * @returns Array - 返回一个数组，包含是否存在重复、重复的类型、重复的值、lane 名称和文库编号。
     */
    private static checkDuplicateI7IndexIdAndIndexSeqSeparately(laneIndexInfo: LaneIndexInfo): [boolean, string | null, string | null, string | null, string | null] {
        for (let laneName in laneIndexInfo) {
            const tuples = laneIndexInfo[laneName];
            const i7IndexIdSet = new Set();
            const indexSeqSet = new Set();
            for (let tup of tuples) {
                const [i7IndexId, indexSeq, libraryNumber] = tup;
                if (!CheckLibraryIndex.isValid({ seq : indexSeq })) {
                    return [true, '含有ATCG之外的碱基', indexSeq, laneName, libraryNumber];
                }
                if (!CheckLibraryIndex.isValid({ seq : libraryNumber, type : "name"})) {
                    return [true, '含有除了字母、数字、下划线和中划线之外其他的特殊字符', libraryNumber, laneName, libraryNumber]
                }
                if (!CheckLibraryIndex.isValid( { seq: i7IndexId, type: "name" })) {
                    return [true, '含有除了字母、数字、下划线和中划线之外其他的特殊字符', i7IndexId, laneName, libraryNumber]
                }
                if (i7IndexIdSet.has(i7IndexId)) {
                    return [true, 'i7_index_id', i7IndexId, laneName, libraryNumber];
                }
                if (indexSeqSet.has(indexSeq)) {
                    return [true, 'index_seq', indexSeq, laneName, libraryNumber];
                }
                i7IndexIdSet.add(i7IndexId);
                indexSeqSet.add(indexSeq);
            }
        }
        return [false, null, null, null, null];
    }
}

export { CheckLibraryIndex };