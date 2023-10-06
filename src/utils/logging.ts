interface LogLevel {
    level: number;
    console: keyof Console;
}

const LogLevel: { [key: string]: LogLevel } = {
    TRACE: { level: 0, console: 'trace' },
    DEBUG: { level: 1, console: 'debug' },
    TIME: { level: 1, console: 'time' },
    TIME_END: { level: 1, console: 'timeEnd' },
    INFO: { level: 2, console: 'info' },
    WARN: { level: 3, console: 'warn' },
    ERROR: { level: 4, console: 'error' }
};

class Logging {
    level: LogLevel = LogLevel.INFO;
    trace(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.TRACE, message, ...optionalParams);
    }
    debug(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.DEBUG, message, ...optionalParams);
    }
    info(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.INFO, message, ...optionalParams);
    }
    warn(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.WARN, message, ...optionalParams);
    }
    error(message?: any, ...optionalParams: any[]) {
        this.log(LogLevel.ERROR, message, ...optionalParams);
    }
    time(name: string) {
        this.log(LogLevel.TIME, name);
    }
    timeEnd(name: string) {
        this.log(LogLevel.TIME_END, name);
    }

    private log(method: LogLevel, message?: any, ...optionalParams: any[]): void {
        if (method.level >= this.level.level) {
            if (method.console === 'warn') {
                console.warn(message, ...optionalParams);
            } else if (method.console == 'error') {
                console.error(message, ...optionalParams);
            } else if (method.console == 'info') {
                console.info(message, ...optionalParams);
            } else {
                console.log(message, ...optionalParams);
            }
        }
    }
}

export default new Logging();
