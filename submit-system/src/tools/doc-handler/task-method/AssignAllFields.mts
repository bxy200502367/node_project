/*
 * @LastEditTime: 2024/04/03
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import { DocTransactionHandler } from "../DocTransactionHandler.mjs";

/**
 * 类型定义：字段映射
 */
type FieldMappings = {
    [key: string]: {
        [key: string]: string;
    };
};

/**
 * AssignAllFields 类
 * 用于处理字段映射
 */
class AssignAllFields {
    /**
     * 字段映射
     */
    private readonly fieldMappings: FieldMappings = {
        split_status: {
            first_split: "firstSplitStatus",
            second_split: "secondSplitStatus",
            qc: "qcStatus",
            upload: "uploadStatus"
        },
        split_task_id: {
            first_split: "firstSplitTaskId",
            second_split: "secondSplitTaskId",
            qc: "qcTaskId",
            upload: "uploadTaskId"
        },
        split_ts: {
            first_split: "firstSplitTs",
            second_split: "secondSplitTs",
            qc: "qcTs",
            upload: "uploadTs"
        },
        split_workdir: {
            LibrarySplit: "firstSplitWorkdir",
            SampleSplit: "secondSplitWorkdir",
            SampleQc: "qcWorkdir",
            UploadData: "uploadDataWorkdir"
        },
        split_check: {
            has_meta: "hasMeta",
            has_other: "hasOther",
            has_pure_library: "hasPureLibrary",
            has_pure_sequence: "hasPureSequence",
            all_pure_sequence: "allPureSequence",
            check_params: "checkParamsStatus",
            check_library: "checkLibraryStatus",
            check_specimen: "checkSpecimenStatus",
            check_seq_model: "checkSeqModelStatus",
            check_bcl_path: "checkBclPathStatus",
        },
    };

    /**
     * 为所有字段分配值
     * @param Doc - 包含字段的对象
     */
    public assignAllFields(Doc: DocTransactionHandler) {
        for (const [sourceField, targetFields] of Object.entries(
            this.fieldMappings
        )) {
            AssignAllFields.assignFields(Doc, sourceField, targetFields);
        }
    }

    /**
     * 为指定的字段分配值
     * @param Doc - 包含字段的对象
     * @param sourceField - 源字段名
     * @param targetFields - 目标字段名
     * @param defaultVal - 默认值
     */
    private static assignFields(
        Doc: DocTransactionHandler,
        sourceField: string,
        targetFields: { [key: string]: string },
        defaultVal: any = {}
    ) {
        const sourceData = AssignAllFields.getField(Doc.doc, sourceField, defaultVal);
        for (const [sourceKey, targetKey] of Object.entries(targetFields)) {
            Doc.extraProps[targetKey] = sourceData[sourceKey];
        }
    }

    /**
     * 获取字段的值
     * @param doc - 包含字段的对象
     * @param fieldName - 字段名
     * @param defaultValue - 默认值
     * @returns 字段的值，如果字段不存在，则返回默认值
     */
    public static getField(
        doc: any,
        fieldName: string,
        defaultValue: any = undefined
    ): any {
        return doc.hasOwnProperty(fieldName) ? doc[fieldName] : defaultValue;
    }

    /**
     * 检查一个对象是否有特定的属性。
     * @param doc - 需要检查的对象。
     * @param fieldName - 需要检查的属性名。
     * @returns boolean - 如果对象有这个属性，返回 true，否则返回 false。
     */
    public static hasField(doc: any, fieldName: string): boolean {
        return doc.hasOwnProperty(fieldName);
    }
}

export { AssignAllFields };
