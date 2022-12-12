/* istanbul ignore file */
import chalk from 'chalk'
import CLITable from 'cli-table3'
import pino from 'pino'

const WEWEB = `                                                    __  
                 _      __  ___  _      __  ___    / /_ 
                | | /| / / / _ \\| | /| / / / _ \\  / __ \\
                | |/ |/ / /  __/| |/ |/ / /  __/ / /_/ /
                |__/|__/  \\___/ |__/|__/  \\___/ /_.___/
`

/**
 * Logger service.
 * @export
 * @class Logger
 */
export default class Logger {
    /** levels available. */
    public readonly levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']
    /** Weweb default color. */
    public readonly wewebColor = '#cf2d7d'
    /** Return line character. */
    public readonly returnLine = '\n'
    /** Pino logger. */
    private log: any

    /**
     * Creates an instance of Logger.
     * @memberof Logger
     */
    constructor() {
        this.log = pino({
            level: process.env.WW_LOG_LEVEL || 'trace',
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                },
            },
        })
    }

    /**
     * Print weweb header.
     * @memberof Logger
     */
    public printWeweb() {
        if (process.env.NODE_ENV === 'test') return
        console.log(chalk.hex(this.wewebColor)(WEWEB))
    }

    /**
     * Print Weweb server information.
     * ! Require env info
     * @param {string} title
     * @memberof Logger
     */
    public printServerInfo() {
        if (process.env.NODE_ENV === 'test' || process.env.HIDE_VERSION) return
        const infoTable = new CLITable({
            colWidths: [20, 50],
            chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        })

        infoTable.push(
            [chalk.hex(this.wewebColor)('Name'), process.env.npm_package_name.toUpperCase()],
            [chalk.hex(this.wewebColor)('Time'), `${new Date()}`],
            [chalk.hex(this.wewebColor)('Environment'), process.env.NODE_ENV],
            [chalk.hex(this.wewebColor)('wwEnv'), process.env.WW_ENV],
            [chalk.hex(this.wewebColor)('Version'), `${process.env.npm_package_version} (node ${process.version})`],
            [chalk.hex(this.wewebColor)('Port'), process.env.PORT || 3000]
        )

        console.log(infoTable.toString(), this.returnLine)
    }

    /**
     * Returns colored status.
     * @private
     * @param {number} status
     * @returns {string}
     * @memberof Logger
     */
    private computeStatus(status: number): string {
        return status >= 500
            ? chalk.red(status)
            : status >= 400
            ? chalk.yellow(status)
            : status > 300
            ? chalk.blue(status)
            : status >= 200
            ? chalk.green(status)
            : chalk.grey(status)
    }

    /**
     * Returns colored method.
     * @private
     * @param {string} method
     * @returns {string}
     * @memberof Logger
     */
    private computeMethod(method: string): string {
        switch (method) {
            case 'GET':
                return chalk.green(method)
            case 'POST':
                return chalk.yellow(method)
            case 'PUT':
                return chalk.blue(method)
            case 'DELETE':
                return chalk.red(method)
            default:
                return chalk.grey(method)
        }
    }

    /**
     * Print colored request.
     * @param {string} method
     * @param {string} url
     * @param {number} resTime
     * @param {string} status
     * @memberof Logger
     */
    public printRequest(method: string, url: string, resTime: number, status: string) {
        this.info('%s %s %s %s', this.computeMethod(method), chalk.white(url), chalk.white(`(${resTime} ms)`), this.computeStatus(parseInt(status)))
    }

    /** Log fatal */
    public fatal(...args: any) {
        this.log.fatal(...args)
    }
    /** Log error */
    public error(...args: any) {
        this.log.error(...args)
    }
    /** Log warn */
    public warn(...args: any) {
        this.log.warn(...args)
    }
    /** Log info */
    public info(...args: any) {
        this.log.info(...args)
    }
    /** Log debug */
    public debug(...args: any) {
        this.log.debug(...args)
    }
    /** Log trace */
    public trace(...args: any) {
        this.log.trace(...args)
    }
}
