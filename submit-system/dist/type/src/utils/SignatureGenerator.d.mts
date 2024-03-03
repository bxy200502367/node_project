declare class SignatureGenerator {
    static getSubmitSignature(client: string, mysql_client_key: string): string;
    static getDingWebhook(webhook: string, secret: string): string;
    private static createHash;
    private static createHmacSignature;
}
export { SignatureGenerator };
//# sourceMappingURL=SignatureGenerator.d.mts.map