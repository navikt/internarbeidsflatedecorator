class Logger {
    private isEnabled = true;

    readonly disableLogger = () => {
        this.isEnabled = false;
    };

    readonly log = (...message: any[]) => {
        if (!this.isEnabled) return;
        console.log(...message);
    };
}

export default new Logger();
