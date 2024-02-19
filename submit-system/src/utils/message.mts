import chalk from 'chalk';

type ChalkSingleColorKeys = 
    | 'black' 
    | 'red' 
    | 'green' 
    | 'yellow' 
    | 'blue' 
    | 'magenta' 
    | 'cyan' 
    | 'white' 
    | 'gray' 
    | 'redBright' 
    | 'greenBright' 
    | 'yellowBright' 
    | 'blueBright' 
    | 'magentaBright' 
    | 'cyanBright' 
    | 'whiteBright';

/**
 * 打印带颜色的信息
 * @param message - 需要打印的信息
 * @param color - 信息的颜色，默认为 'yellow'
 */
const logMessage = (message: any, color: ChalkSingleColorKeys = 'yellow'): void => {
    console.log(chalk[color](message));
};

/**
 * 退出进程
 * @param code - 退出状态码
 */
const exitProcess = (code: number): void => {
    process.exit(code);
};

/**
 * 打印错误信息并退出进程
 * @param message - 需要打印的错误信息
 * @param color - 错误信息的颜色，默认为 'redBright'
 */
const exitWithError = (message: any, color: ChalkSingleColorKeys = 'redBright', code: number = 1): void => {
    logMessage(message, color);
    exitProcess(code);
};

export { logMessage, exitWithError };