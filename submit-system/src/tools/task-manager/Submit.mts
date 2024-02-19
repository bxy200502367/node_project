#!/usr/bin/env node

/*
 * @LastEditTime: 2024/02/07
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */

import to from 'await-to-js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { ConfigLoader } from '../../utils/ConfigLoader.mjs';
import { SignatureGenerator } from '../../utils/SignatureGenerator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

axiosRetry(axios, { retries: 3 });

type Params = { [key: string]: boolean | number | string };

enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH"
}

interface SubmitArgs {
    api: string;
    params: Params;
    types?: string;
    method?: HttpMethod;
    configPath?: string;
}

interface TypeConfig {
    url: string;
    client: string;
    mysql_client_key: string
}

/**
 * 用来提交任务
 * NOTE: config文件可能会多次加载,将配置文件的内容缓存到内存中优化
 */
class Submit {
    private static readonly DEFAULT_CONFIG: TypeConfig = {
        url: "http://wpm2sh.sanger.com",
        client: "client01",
        mysql_client_key: "1ZYw71APsQ"
    };
    private readonly method: HttpMethod
    private readonly api: string;
    private readonly params: Params;
    private readonly url: string;
    private readonly client: string;
    private readonly mysql_client_key: string;

    /**
     * 创建一个新的提交实例。
     *
     * @param {Object} args - 构造函数的参数。
     * @param {string} args.api - 提交的URL。
     * @param {Params} args.params - 提交的参数。
     * @param {HttpMethod} [args.method=HttpMethod.POST] - HTTP方法。
     * @param {string} [args.types="default"] - 提交的类型。
     * @param {string} [args.configPath=path.join(__dirname, '../config/typeConfig.json')] - 配置文件的路径。
     * @throws {Error} 当配置无效时抛出错误。
     */
    constructor({ api, params, method = HttpMethod.POST, types = "default", configPath = path.join(__dirname, '../../config/typeConfig.json') }: SubmitArgs) {
        this.method = method;
        this.api = api;
        if (!this.api.startsWith('/')) {
            this.api = '/' + this.api;
        }
        this.params = params;
        const typeConfig = this.loadConfig(configPath, types);
        if (!typeConfig || !typeConfig.url || !typeConfig.client || !typeConfig.mysql_client_key) {
            throw new Error(`无效的配置: ${types}`);
        }
        this.url = typeConfig.url;
        this.client = typeConfig.client;
        this.mysql_client_key = typeConfig.mysql_client_key;
    }

    /**
     * 加载指定类型的配置。
     * 
     * @param configPath 配置文件的路径。
     * @param types 配置的类型。
     * @returns 返回指定类型的配置。如果在读取配置文件时发生错误，返回一个默认的配置。
     */
    private loadConfig(configPath: string, types: string): TypeConfig {
        return ConfigLoader.loadConfig(configPath, types, () => Submit.DEFAULT_CONFIG);
    }

    /**
     * 发送请求并处理响应。
     * @returns {Promise<any>} 返回响应数据。
     * @throws 当请求失败或处理响应数据时发生错误，抛出错误。
     */
    public async sendApiRequest(): Promise<any> {
        const data = new URLSearchParams(this.params as Record<string, string>).toString();
        const signature = SignatureGenerator.getSubmitSignature(this.client, this.mysql_client_key)
        const url = `${this.url}${this.api}?${signature}`;
        const options = {
            method: this.method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: data,
        };

        return this.sendRequest(url, options);
    }

    /**
     * 发送请求并处理响应。
     * @param url 请求的URL。
     * @param options 请求的选项。
     * @returns {Promise<any>} 返回响应数据。
     * @throws 当请求失败或处理响应数据时发生错误，抛出错误。
     */
    private async sendRequest(url: string, options: any): Promise<any> {
        const [err, res] = await to(axios(url, options));

        if (err) {
            throw err;
        }

        return this.handleResponse(res);
    }

    /**
     * 处理响应。
     * @param res 响应对象。
     * @returns {any} 返回响应数据。
     * @throws 当处理响应数据时发生错误，抛出错误。
     */
    private handleResponse(res: any): any {
        const contentType = res.headers['content-type'];
        switch (contentType) {
            case 'application/json':
            case undefined:
                // console.log(res.data);
                break;
            case 'text/html':
                throw new Error(`Unexpected HTML response: ${res.data}`);
            default:
                throw new Error(`Unexpected content type: ${contentType}`);
        }
        return res.data;
    }

    //     return new Promise((resolve, reject) => {
    //         const req = http.request(url, options, (res) => {
    //             let data = '';
    //             res.on('data', (chunk) => {
    //                 data += chunk;
    //             });
    //             res.on('end', () => {
    //                 try {
    //                     if (!res.headers['content-type'] || res.headers['content-type'].includes('application/json')) {
    //                         const result = JSON.parse(data);
    //                         const resultString = JSON.stringify(result, null, 0);
    //                         if (result.success) {
    //                             console.log(resultString);
    //                         } else {
    //                             console.error(resultString);
    //                         }
    //                         resolve(result);
    //                     } else if (res.headers['content-type'].includes('text/html')) {
    //                         console.log(`Received HTML: ${data}`);
    //                         resolve(data);
    //                     } else {
    //                         throw new Error('Unexpected content type: ' + res.headers['content-type']);
    //                     }
    //                 } catch (err) {
    //                     console.error('解析结果失败:', err);
    //                     reject(err);
    //                 }
    //             });
    //         });

    //         req.on('error', (error) => {
    //             console.error(`接口投递失败: ${error}`);
    //             reject(error);
    //         });

    //         req.write(data);
    //         req.end();
    //     });
    // }
}

// if (require.main === module) {

//     /**
//      * 定义参数接口
//      */
//     interface Args {
//         method: string;
//         api: string;
//         params_key: string;
//         params_value: string;
//         [key: string]: string;
//     }

//     /**
//      * 解析命令行参数
//      */
//     const argv = yargs(hideBin(process.argv))
//         .usage('Usage: $0 -m [method] -a [api] -k [params_key] -v [params_value]')
//         .option('method', {
//             alias: 'm',
//             type: 'string',
//             describe: 'http方法',
//             default: 'POST',
//             demandOption: true
//         })
//         .option('api', {
//             alias: 'a',
//             type: 'string',
//             describe: '要提交的api',
//             demandOption: true
//         })
//         .option('params_key', {
//             alias: 'k',
//             type: 'string',
//             describe: '要提交的参数',
//             demandOption: true
//         })
//         .option('params_value', {
//             alias: 'v',
//             type: 'string',
//             describe: '要提交的参数值',
//             demandOption: true
//         })
//         .group(['method', 'api'], 'API Options:')
//         .group(['params_key', 'params_value'], 'Parameter Options:')
//         .check(argv => {
//             const paramArray = ['method', 'api', 'params_key', 'params_value'];

//             for (const param of paramArray) {
//                 if (!argv[param]) {
//                     throw new Error(`${param} 参数值不能为空`);
//                 }
//             }

//             const keysArray = argv.params_key.split(';');
//             const valuesArray = argv.params_value.split(';');

//             if (keysArray.length !== valuesArray.length) {
//                 throw new Error('参数数量和参数值长度不匹配');
//             }

//             if (!(argv.method in HttpMethod)) {
//                 throw new Error('无效的HTTP方法:' + argv.method);
//             }

//             return true;
//         })
//         .argv;

//     /**
//      * 发送API请求并处理响应
//      */
//     (async (argv: Args) => {
//         const keysArray = argv.params_key.split(';');
//         const valuesArray = argv.params_value.split(';');
//         const params = keysArray.reduce((obj, key, index) => {
//             obj[key] = valuesArray[index];
//             return obj;
//         }, {} as Record<string, string>);
//         const submitInstance = new Submit({
//             api: argv.api,
//             params: params,
//             method: argv.method as HttpMethod
//         });
//         const [err, result] = await to(submitInstance.sendApiRequest());
//         if (err) {
//             console.error('接口投递失败:', err.message);
//             process.exit(1);
//         } else {
//             console.log(JSON.stringify(result, null, 0));
//         }
//     })(argv as Args);
// }

export { Submit }