import { DocTransactionHandler } from "../DocTransactionHandler.mjs";
declare class CheckSpecimenBarcode {
    checkSpecimenBarcode(Doc: DocTransactionHandler): Promise<boolean>;
    private static isValidSeq;
    private static checkDuplicateBarcodeTagAndBarcodeSeq;
}
export { CheckSpecimenBarcode };
//# sourceMappingURL=CheckSpecimenBarcode.d.mts.map