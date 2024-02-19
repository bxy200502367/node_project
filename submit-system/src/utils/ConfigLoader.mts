/*
 * @LastEditTime: 2024/02/18
 * @Author: yuan.xu
 * @mail: yuan.xu@majorbio.com
 */
import * as fs from 'fs';
/**
 * 配置加载器类
 */
class ConfigLoader {
    /**
     * 缓存已加载的配置
     */
    static configCache: { [key: string]: any } = {};

    /**
     * 加载配置
     * @param configPath 配置文件路径
     * @param name 配置名称
     * @param defaultConfig 默认配置生成函数
     * @returns 加载的配置
     */
    static loadConfig<T>(configPath: string, name: string, defaultConfig: () => T): T {
        // 如果缓存中已有该配置，直接返回
        if (ConfigLoader.configCache[name]) {
            return ConfigLoader.configCache[name];
        }

        let config: T;
        try {
            // 尝试从文件中读取配置
            const data = fs.readFileSync(configPath, 'utf8');
            config = JSON.parse(data)[name];
        } catch (err: unknown) {
            // 如果读取文件失败，打印错误信息并使用默认的配置
            if (err instanceof Error) {
                console.error(`读取配置文件${configPath}失败 ${err.message}`);
            } else {
                console.error(`读取配置文件${configPath}失败 ${err}`);
            }
            config = defaultConfig();
        }

        return config;
    }
}

export { ConfigLoader };