import to from 'await-to-js';
import { Doc, DocTransactionHandler } from "../DocTransactionHandler.mjs";

interface LibraryInfo {
    [key: string]: [string, string, string][];
}

/**
 * CheckSpecimenBarcode 类用于检查样本barcode。
 */
class CheckSpecimenBarcode {
    /**
     * 检查样本barcode。
     * @param Doc - DocTransactionHandler 类的实例，用于处理文档事务。
     * @returns Promise<boolean> - 返回一个 Promise，当 Promise 完成时，表示检查操作已经完成。
     */
    public async checkSpecimenBarcode(Doc: DocTransactionHandler): Promise<boolean> {
        const libraryInfo: LibraryInfo = {};
        const query = {
            "split_id": Doc.splitId,
            "product_type": "meta"
        };
        const [error, result] = await to(Doc.sgSplitSpecimenCol.find(query).toArray());
        if (error) {
            throw Error(`任务 ${Doc.taskSn} 数据库查找失败: ${error.message}`)
        }
        result.forEach((doc: Doc) => {
            const {
                library_id,
                library_number = "",
                barcode_tag = "",
                f_barcode = "",
                r_barcode = ""
            } = doc;
            const libraryId = String(library_id);
            const barcodeSeq = `${f_barcode}--${r_barcode}`;
            libraryInfo[libraryId] = libraryInfo[libraryId] || [];
            libraryInfo[libraryId].push([barcode_tag, barcodeSeq, library_number]);
        })
        const [isDuplicate, duplicateType, duplicateValue, libraryNumber] = CheckSpecimenBarcode.checkDuplicateBarcodeTagAndBarcodeSeq(libraryInfo);
        let desc;
        if (isDuplicate) {
            desc = `任务 ${Doc.taskSn} 的文库 ${libraryNumber} 的 ${duplicateType} 重复,重复的 ${duplicateType} 为 ${duplicateValue};请检查,重新配置barcode`;
            const [error, _] = await to(Doc.updateInfoFuction(desc, "configure", { "split_check.check_specimen": false }));
            if (error) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
            }
        } else {
            desc = `任务 ${Doc.taskSn} 的多样性样本barcode检查通过`;
            const [error, _] = await to(Doc.updateInfoFuction(desc, null, { "split_check.check_specimen": true }));
            if (error) {
                throw Error(`任务 ${Doc.taskSn} 数据库更新失败: ${error.message}`)
            }
        }
        return !isDuplicate;
    }

    /**
     * 使用正则表达式来检查 indexSeq 序列中是否只包含 "A", "T", "C", "G" 和 "-"
     * @param indexSeq - 需要检查的序列。
     * @returns boolean - 如果序列只包含 "A", "T", "C", "G" 和 "-"，返回 true，否则返回 false。
     */
    private static isValidSeq(indexSeq: string): boolean {
        const regex = /^[ATCG-]*$/;
        return regex.test(indexSeq);
    }

    /**
     * 检查是否存在重复的barcode标签和barcode序列。
     * @param libraryInfo - 需要检查的信息。
     * @returns Array - 返回一个数组，包含是否存在重复、重复的类型、重复的值和文库编号。
     */
    private static checkDuplicateBarcodeTagAndBarcodeSeq(libraryInfo: LibraryInfo): [boolean, string | null, string | null, string | null] {
        for (let libraryId in libraryInfo) {
            const tuples = libraryInfo[libraryId];
            const barcodeTagSet = new Set();
            const barcodeSeqSet = new Set();
            for (let tup of tuples) {
                const [barcodeTag, barcodeSeq, libraryNumber] = tup;
                if (!CheckSpecimenBarcode.isValidSeq(barcodeSeq)) {
                    return [true, '含有ATCG之外的碱基', barcodeSeq, libraryNumber];
                }
                if (barcodeTagSet.has(barcodeTag)) {
                    return [true, 'barcode_tag', barcodeTag, libraryNumber];
                }
                if (barcodeSeqSet.has(barcodeSeq)) {
                    return [true, 'barcode_seq', barcodeSeq, libraryNumber];
                }
                barcodeTagSet.add(barcodeTag);
                barcodeSeqSet.add(barcodeSeq);
            }
        }
        return [false, null, null, null];
    }
}

export { CheckSpecimenBarcode };