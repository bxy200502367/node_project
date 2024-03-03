import { AssignAllFields } from './task-method/AssignAllFields.mjs';
import { HasMeta } from './task-method/HasMeta.mjs';
import { HasOther } from './task-method/HasOther.mjs';
import { HasParams } from './task-method/HasParams.mjs';
import { CheckLibraryIndex } from './task-method/CheckLibraryIndex.mjs';
import { CheckSpecimenBarcode } from './task-method/CheckSpecimenBarcode.mjs';
import { CheckSeqModel } from './task-method/CheckSeqModel.mjs';
import { CheckParallelBclPath } from './task-method/CheckParallelBclPath.mjs';
import { GetWorkdir } from './task-method/GetWorkdir.mjs';
import { Collection, ObjectId } from 'mongodb';
import { Logger } from '../../utils/Logger.mjs';
type OptionalString = string | null | undefined;
type Doc = {
    [key: string]: any;
};
type ExtraProps = {
    firstSplitStatus?: string;
    secondSplitStatus?: string;
    qcStatus?: string;
    firstSplitTaskId?: string;
    secondSplitTaskId?: string;
    qcTaskId?: string;
    firstSplitTs?: string;
    secondSplitTs?: string;
    qcTs?: string;
    firstSplitWorkdir?: string;
    secondSplitWorkdir?: string;
    qcWorkdir?: string;
    hasMeta?: boolean;
    hasOther?: boolean;
    checkParamsStatus?: boolean;
    checkLibraryStatus?: boolean;
    checkSpecimenStatus?: boolean;
    checkSeqModelStatus?: boolean;
    checkBclPathStatus?: boolean;
    [key: string]: any;
};
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
};
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
    params: {
        [key: string]: any;
    };
    queryMain: {
        _id?: ObjectId;
    };
    initPromise: Promise<void>;
    init(): Promise<void>;
    updateInfoFuction(desc: string, status: string | null, additionalFields: object): Promise<void>;
}
declare class DocTransactionHandler implements IDocTransactionHandler {
    readonly logger: Logger;
    extraProps: ExtraProps;
    extraMethods: ExtraMethods;
    readonly doc: Doc;
    readonly sgSplitCol: Collection<Doc>;
    readonly sgSplitLibraryCol: Collection<Doc>;
    readonly sgSplitSpecimenCol: Collection<Doc>;
    hasField: (fieldName: string) => boolean;
    taskSn: OptionalString;
    status: OptionalString;
    splitStatus: OptionalString;
    splitId: ObjectId;
    params: {
        [key: string]: any;
    };
    queryMain: {
        _id?: ObjectId;
    };
    initPromise: Promise<void>;
    constructor(doc: Doc, sgSplitCol: Collection<Doc>, sgSplitLibraryCol: Collection<Doc>, sgSplitSpecimenCol: Collection<Doc>);
    init(): Promise<void>;
    updateInfoFuction(desc: string, status?: string | null, additionalFields?: object): Promise<void>;
}
export { Doc, DocTransactionHandler };
//# sourceMappingURL=DocTransactionHandler.d.mts.map