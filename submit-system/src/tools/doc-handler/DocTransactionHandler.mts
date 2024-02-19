/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import * as moment from 'moment';
import { AssignAllFields } from './task-method/AssignAllFields.mjs';
import { HasMeta } from './task-method/HasMeta.mjs';
import { HasOther } from './task-method/HasOther.mjs';
import { HasParams } from './task-method/HasParams.mjs';
import { CheckLibraryIndex } from './task-method/CheckLibraryIndex.mjs';
import { CheckSpecimenBarcode } from './task-method/CheckSpecimenBarcode.mjs';
import { CheckSeqModel } from './task-method/CheckSeqModel.mjs';
import { CheckParallelBclPath } from './task-method/CheckParallelBclPath.mjs';
import { GetWorkdir } from './task-method/GetWorkdir.mjs'
import { Collection, ObjectId } from 'mongodb';
import { Logger } from '../../utils/Logger.mjs'

type OptionalString = string | null | undefined;

type Info = {
    desc: string;
    updated_ts: string;
    status?: string;
    'split_status.params'?: string;
    [key: string]: any; //允许额外的字段
}

type Doc = { [key: string]: any; };

type ExtraProps = {
    firstSplitStatus?: string; // 文库拆分的状态
    secondSplitStatus?: string; // 样本拆分的状态
    qcStatus?: string; // 样本质控的状态
    firstSplitTaskId?: string; // 文库拆分的workflow id
    secondSplitTaskId?: string; // 样本拆分的workflow id
    qcTaskId?: string; // 样本质控的workflow id
    firstSplitTs?: string; // 文库拆分的启动时间
    secondSplitTs?: string; // 样本拆分的启动时间
    qcTs?: string; // 样本质控的启动时间
    firstSplitWorkdir?: string; // 文库质控的工作目录
    secondSplitWorkdir?: string; // 样本拆分的工作目录
    qcWorkdir?: string; // 样本质控的工作目录
    hasMeta?: boolean; // 是否存在多样性样本
    hasOther?: boolean; // 是否存在非多样性样本
    checkParamsStatus?: boolean; // 参数检查是否通过
    checkLibraryStatus?: boolean; // 文库检查是否通过
    checkSpecimenStatus?: boolean; // barcode检查是否通过
    checkSeqModelStatus?: boolean; // 测序模式检查是否通过
    checkBclPathStatus?: boolean; // bcl路径检查是否通过
    [key: string]: any;
}

type ExtraMethods = {
    assignAllFields: AssignAllFields;
    hasMeta: HasMeta;
    hasOther: HasOther;
    hasParams: HasParams;
    checkLibraryIndex: CheckLibraryIndex;
    checkSpecimenBarcode: CheckSpecimenBarcode;
    checkSeqModel: CheckSeqModel;
    checkParallelBclPath: CheckParallelBclPath;
    getWorkdir: GetWorkdir;
    [key: string]: any;
}

// 定义DocTransactionHandler接口 IDocTransactionHandler
interface IDocTransactionHandler {
    logger: Logger;
    extraProps: ExtraProps;
    extraMethods: ExtraMethods;
    doc: Doc;
    sgSplitCol: Collection<Doc>;
    sgSplitLibraryCol: Collection<Doc>;
    sgSplitSpecimenCol: Collection<Doc>;
    hasField: (fieldName: string) => boolean;
    taskSn: OptionalString;
    status: OptionalString;
    splitStatus: OptionalString;
    splitId: ObjectId;
    params: { [key: string]: any; };
    queryMain: { _id?: ObjectId };
    initPromise: Promise<void>;
    init(): Promise<void>;
    updateInfoFuction(desc: string, status: string | null, additionalFields: object): Promise<void>;
}

/**
 * DocTransactionHandler类用于处理文档事务。
 */
class DocTransactionHandler implements IDocTransactionHandler {
    public readonly logger: Logger = new Logger();
    public extraProps: ExtraProps = {};
    public extraMethods: ExtraMethods = {
        assignAllFields: new AssignAllFields(),
        hasMeta: new HasMeta(),
        hasOther: new HasOther(),
        hasParams: new HasParams(),
        checkLibraryIndex: new CheckLibraryIndex(),
        checkSpecimenBarcode: new CheckSpecimenBarcode(),
        checkSeqModel: new CheckSeqModel(),
        checkParallelBclPath: new CheckParallelBclPath(),
        getWorkdir: new GetWorkdir()
    };
    public readonly doc: Doc;
    public readonly sgSplitCol: Collection<Doc>;
    public readonly sgSplitLibraryCol: Collection<Doc>;
    public readonly sgSplitSpecimenCol: Collection<Doc>;
    public hasField: (fieldName: string) => boolean;
    public taskSn: OptionalString;
    public status: OptionalString;
    public splitStatus: OptionalString;
    public splitId: ObjectId;
    public params: { [key: string]: any; };
    public queryMain: { _id?: ObjectId };
    public initPromise: Promise<void>;

    /**
     * 构造函数初始化DocTransactionHandler类的实例。
     * @param doc - 文档对象。
     * @param sgSplitCol - 分割集合。
     * @param sgSplitLibraryCol - 分割库集合。
     * @param sgSplitSpecimenCol - 分割样本集合。
     */
    constructor(doc: Doc, sgSplitCol: Collection<Doc>, sgSplitLibraryCol: Collection<Doc>, sgSplitSpecimenCol: Collection<Doc>) {
        this.doc = doc;
        this.sgSplitCol = sgSplitCol;
        this.sgSplitLibraryCol = sgSplitLibraryCol;
        this.sgSplitSpecimenCol = sgSplitSpecimenCol;
        this.hasField = (fieldName: string) => AssignAllFields.hasField(this.doc, fieldName);
        this.taskSn = AssignAllFields.getField(this.doc, "task_sn"); //任务编号
        this.status = AssignAllFields.getField(this.doc, "status"); //任务的主状态
        this.splitStatus = AssignAllFields.getField(this.doc, "split_status"); //任务的子状态
        this.splitId = AssignAllFields.getField(this.doc, "_id"); //任务的id编号
        this.params = JSON.parse(AssignAllFields.getField(this.doc, "params", "{}")); //如果params不存在，返回一个空的JSON对象
        this.extraMethods.assignAllFields.assignAllFields(this); // 动态挂载属性
        this.queryMain = { "_id": this.splitId };
        this.initPromise = this.init();
    }

    /**
     * 异步加载属性。
     */
    public async init(): Promise<void> {
        await this.extraMethods.hasMeta.hasMeta(this);
        await this.extraMethods.hasOther.hasOther(this);
    }

    /**
     * 更新信息函数。
     * @param desc - 描述。
     * @param status - 状态。
     * @param additionalFields - 额外的字段。
     */
    public async updateInfoFuction(desc: string, status: string | null = null, additionalFields: object = {}): Promise<void> {
        const info: Info = {
            desc: desc,
            updated_ts: moment().format("YYYY-MM-DD HH:mm:ss"),
            ...additionalFields
        };
        if (status) {
            info.status = status;
            info['split_status.params'] = 'start';
        }
        await this.sgSplitCol.updateOne(this.queryMain, { $set: info });
        this.logger[status ? 'error' : 'info'](desc);
        // console[status ? 'error' : 'log'](desc);
    }
}

export { Doc, DocTransactionHandler };