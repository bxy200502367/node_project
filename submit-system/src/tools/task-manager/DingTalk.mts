import * as path from 'path';
import { fileURLToPath } from 'url';
import to from 'await-to-js';
import axios, { AxiosResponse } from 'axios';
import { ConfigLoader } from '../../utils/ConfigLoader.mjs';
import { SignatureGenerator } from '../../utils/SignatureGenerator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DingConfig {
    webhook: string;
    secret: string;
}

interface DingTalkResponse {
    errcode: number;
    errmsg: string;
}

class DingTalk {
    private static readonly DEFAULT_CONFIG: DingConfig = {
        webhook: "",
        secret: ""
    };
    private webhook: string;
    private secret: string;

    /**
     * 构造函数
     * 
     * @param {string} configPath - 配置文件路径
     * @param {string} name - 配置名称
     */
    constructor(name: string, configPath: string = path.join(__dirname, '../../config/dingConfig.json')) {
        const dingConfig = this.loadConfig(configPath, name);
        if (!dingConfig || !dingConfig.webhook || !dingConfig.secret) {
            throw new Error(`无效的配置: ${name}`);
        }
        this.webhook = dingConfig.webhook;
        this.secret = dingConfig.secret;
    }

    /**
     * 加载配置
     * 
     * @param {string} configPath - 配置文件路径
     * @param {string} name - 配置名称
     * @returns {DingConfig} 返回配置对象
     */
    private loadConfig(configPath: string, name: string): DingConfig {
        return ConfigLoader.loadConfig(configPath, name, () => DingTalk.DEFAULT_CONFIG);
    }

    /**
     * 发送消息
     * 
     * @param {string} message - 消息内容
     * @returns {Promise<void>}
     * @throws {Error} 如果请求失败，则抛出错误
     */
    async sendMessage(message: string): Promise<void> {
        const webhook = SignatureGenerator.getDingWebhook(this.webhook, this.secret)
        const data = {
            msgtype: 'text',
            text: {
                content: message
            }
        };

        const [error, response] = await to(this.sendRequest(webhook, data));
        if (error) {
            throw new Error(`发送钉钉消息失败:: ${error.message}`);
        }
        if (response.data.errcode !== 0) {
            throw new Error(`DingTalk API error: ${response.data.errmsg}`);
        }
    }

    /**
     * 发送请求
     * 
     * @param {string} url - 请求URL
     * @param {any} data - 请求数据
     * @returns {Promise<AxiosResponse<DingTalkResponse>>} 返回响应对象
     */
    private async sendRequest(url: string, data: any): Promise<AxiosResponse<DingTalkResponse>> {
        return await axios.post(url, data);
    }
}

// if (require.main === module) {
//     // 如果这个文件作为主程序运行，发送一条测试消息
//     (async () => {
//         const dingTalk = new DingTalk('xiaomei');
//         const [error, _] = await to(dingTalk.sendMessage('我是小美'));
//         if (error) {
//             console.error(`消息发送失败: ${error.message}`);
//         } else {
//             console.log('消息发送成功');
//         }
//     })();
// }

export { DingTalk };