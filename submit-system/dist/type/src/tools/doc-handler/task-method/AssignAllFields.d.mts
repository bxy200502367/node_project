import { DocTransactionHandler } from "../DocTransactionHandler.mjs";
declare class AssignAllFields {
    private readonly fieldMappings;
    assignAllFields(Doc: DocTransactionHandler): void;
    private static assignFields;
    static getField(doc: any, fieldName: string, defaultValue?: any): any;
    static hasField(doc: any, fieldName: string): boolean;
}
export { AssignAllFields };
//# sourceMappingURL=AssignAllFields.d.mts.map