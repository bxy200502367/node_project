import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import * as getCallerFile from 'get-caller-file';
import * as moment from 'moment'

import { DingTalk } from '../tools/task-manager/DingTalk.mjs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日志配置接口
interface LoggerConfig {
    level?: string; // 日志级别，默认为 'debug'
    timeFormat: string; // 日志时间格式
    logFormat: string; // 日志格式模板
    console: { [key: string]: any }; // 控制台传输配置
    errorJsonFile: { [key: string]: any }; // 错误JSON日志文件传输配置
    errorFile: { [key: string]: any }; // 错误日志文件传输配置
    jsonFile: { [key: string]: any }; // JSON日志文件传输配置
    allFile: { [key: string]: any }; // 全部日志文件传输配置
}

class Logger {
    /** info常见属性
    * level: 日志条目的日志级别，例如info, warn, error等。
    * message: 日志条目的主要信息文本。
    * timestamp: 日志条目的时间戳，通常是一个ISO 8601格式的字符串。
    * meta: 与日志条目相关的任何额外信息或元数据。这是一个对象，可以包含任何你想要记录的额外数据。
    * splat: 如果你使用%d, %s等格式化字符串，splat属性会包含这些格式化字符串的参数。
    * label: 一个可选的标签，可以用于为日志条目分组或标识。
    * ms: 自上一个日志条目以来经过的毫秒数。
    * pid: 当前进程的进程ID。
    * hostname: 主机名。
    * service: 应用程序或服务的名称，通常在创建Logger时指定。
    */
    private readonly logger: winston.Logger;
    private xiaomei: DingTalk;
    private DS: DingTalk;
    private errorMessages: any[]

    /**
     * 创建Logger实例，读取配置文件并初始化日志记录器。
     * @param configFilePath 日志配置文件路径，默认为当前目录下的loggingConfig.json
     */
    constructor(configFilePath: string = path.join(__dirname, "../config/loggingConfig.json")) {
        this.xiaomei = new DingTalk('xiaomei');
        this.DS = new DingTalk('DS');
        if (!fs.existsSync(configFilePath)) {
            throw new Error(`配置文件 ${configFilePath} 不存在`);
        }
        const configData = fs.readFileSync(configFilePath, 'utf8');
        const configs: LoggerConfig = JSON.parse(configData);

        const error_json_file = path.join(configs.errorJsonFile.dirname, `${configs.errorJsonFile.filename}.${moment().format(configs.errorJsonFile.datePattern)}`)
        this.errorMessages = this.loadJsonFile(error_json_file);
        // 创建一个自定义的winston格式化函数，用于添加调用者文件信息
        const callerFileFormat = winston.format((info) => {
            info.callerFile = getCallerFile();
            return info;
        });

        // 创建一个简单的日志格式化函数，用于输出文本格式的日志
        const simpleFormat = winston.format.printf((info) => {
            const date = new Date(info.timestamp);
            const formattedDate = format(date, configs.timeFormat);
            const logFormat = configs.logFormat
                .replace('{formattedDate}', formattedDate)
                .replace('{level}', info.level)
                .replace('{message}', info.message);
            return logFormat;
        });

        // 创建一个JSON日志格式化函数，用于输出JSON格式的日志
        const jsonFormat = winston.format.printf((info) => {
            const date = new Date(info.timestamp);
            const formattedDate = format(date, configs.timeFormat);
            const logObject = {
                formattedDate,
                level: info.level,
                message: info.message
            };
            return JSON.stringify(logObject);
        });

        // 创建日志传输通道
        const transports: winston.transport[] = [
            new winston.transports.Console(configs.console), // 控制台传输
            new DailyRotateFile({
                ...configs.errorJsonFile,
                format: winston.format.combine(
                    winston.format.json(),
                    winston.format.timestamp(),
                    jsonFormat
                )
            }), // 错误JSON日志文件传输
            new winston.transports.File(configs.errorFile), // 错误日志文件传输
            new DailyRotateFile({
                ...configs.jsonFile,
                format: winston.format.combine(
                    winston.format.json(),
                    winston.format.timestamp(),
                    jsonFormat
                )
            }), // JSON日志文件传输
            new DailyRotateFile(configs.allFile) // 全部日志文件传输
        ];

        // 创建日志记录器实例
        this.logger = winston.createLogger({
            level: configs.level || 'debug', // 设置日志级别，默认为 'debug'
            format: winston.format.combine(
                winston.format.timestamp(), // 添加时间戳
                simpleFormat // 使用自定义的简单格式化函数
            ),
            transports // 设置日志传输方式
        });
    }

    /**
     * 读取error的json文件转化成对象数组
     * @param filePath 要读取的文件路径
     */
    private loadJsonFile(filePath: string): any[] {
        if (!fs.existsSync(filePath)) {
            return [];
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');

        const jsonObjects = [];
        for (const line of lines) {
            if (line) { // 防止空行导致JSON.parse出错
                try {
                    const jsonObject = JSON.parse(line);
                    jsonObjects.push(jsonObject);
                } catch (err) {
                    this.logger.error(`Failed to parse line: ${line}`, err);
                }
            }
        }
        return jsonObjects;
    }

    /**
     * 记录信息级别的日志。
     * @param message 要记录的日志信息
     */
    public info(message: any) {
        this.logger.info(message);
    }

    /**
     * 记录警告级别的日志。
     * @param message 要记录的警告信息
     */
    public warn(message: any) {
        this.logger.warn(message);
    }

    /**
     * 记录错误级别的日志;两小时内不会报同样的错误。
     * @param message 要记录的错误信息
     */
    public error(message: any) {
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        // 检查新的错误消息是否在过去的两个小时内已经记录过
        const isDuplicate = this.errorMessages.some(error => {
            const errorDate = new Date(error.formattedDate);
            return error.message === message && errorDate >= twoHoursAgo;
        });
        if (!isDuplicate) {
            Promise.all([
                this.xiaomei.sendMessage(message),
                this.DS.sendMessage(message)
            ]).catch((error) => {
                this.logger.error(message); (`发送钉钉消息失败: ${error.message}`);
            });
        }
        this.logger.error(message);
    }
}

export { Logger };