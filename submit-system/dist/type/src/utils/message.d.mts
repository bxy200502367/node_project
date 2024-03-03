type ChalkSingleColorKeys = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray' | 'redBright' | 'greenBright' | 'yellowBright' | 'blueBright' | 'magentaBright' | 'cyanBright' | 'whiteBright';
declare const logMessage: (message: any, color?: ChalkSingleColorKeys) => void;
declare const exitWithError: (message: any, color?: ChalkSingleColorKeys, code?: number) => void;
export { logMessage, exitWithError };
//# sourceMappingURL=message.d.mts.map