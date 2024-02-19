import * as crypto from 'crypto';
import * as base64 from 'base64-js';

class SignatureGenerator {
    /**
     * 生成提交签名
     * 
     * @param {string} client - 客户端标识
     * @param {string} mysql_client_key - MySQL客户端密钥
     * @returns {string} 返回查询字符串格式的签名
     */
    static getSubmitSignature(client: string, mysql_client_key: string): string {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const nonce = Math.floor(Math.random() * 9001 + 1000).toString();
        const signature = new URLSearchParams({
            client: client,
            nonce: nonce,
            timestamp: timestamp,
            signature: this.createHash([mysql_client_key, nonce, timestamp].sort())
        }).toString();
        return signature;
    }

    /**
     * 生成钉钉Webhook签名
     * 
     * @param {string} webhook - Webhook URL
     * @param {string} secret - 密钥
     * @returns {string} 返回带有签名的Webhook URL
     */
    static getDingWebhook(webhook: string, secret: string): string {
        const timestamp = Date.now();
        const message = `${timestamp}\n${secret}`;
        const signature = this.createHmacSignature(secret, message);
        return `${webhook}&timestamp=${timestamp}&sign=${signature}`;
    }

    /**
     * 使用SHA1算法对一组字符串进行哈希
     * 
     * @param {string[]} items - 需要进行哈希的字符串数组
     * @returns {string} 返回十六进制格式的哈希值
     */
    private static createHash(items: string[]): string {
        const sha1 = crypto.createHash('sha1');
        items.reduce((hash, item) => hash.update(item, 'utf8'), sha1);
        return sha1.digest('hex');
    }

    /**
     * 使用HMAC SHA256算法和Base64编码生成签名
     * 
     * @param {string} secret - 密钥
     * @param {string} message - 消息
     * @returns {string} 返回Base64编码的签名
     */
    private static createHmacSignature(secret: string, message: string): string {
        return base64.fromByteArray(
            crypto.createHmac('sha256', secret).update(message).digest()
        );
    }
}

export { SignatureGenerator };