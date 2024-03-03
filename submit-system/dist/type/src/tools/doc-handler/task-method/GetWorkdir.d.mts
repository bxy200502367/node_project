import { DocTransactionHandler } from "../DocTransactionHandler.mjs";
declare class GetWorkdir {
    getLibrarySplitWorkdir(Doc: DocTransactionHandler): Promise<string>;
    getSampleSplitWorkdir(Doc: DocTransactionHandler): Promise<string>;
    getSampleQcWorkdir(Doc: DocTransactionHandler): Promise<string>;
    private static getWorkdir;
    private static getSplitData;
    private static checkWorkdirPath;
}
export { GetWorkdir };
//# sourceMappingURL=GetWorkdir.d.mts.map