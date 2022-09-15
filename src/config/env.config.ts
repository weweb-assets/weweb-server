import * as dotenv from 'dotenv'

/**
 * Environment configuration.
 * @export
 * @class Env
 */
export default class Env {
    /** Directory path. */
    public readonly path: string

    /**
     * Creates an instance of Env.
     * ! if NODE_ENV is undefined, set to production.
     * @param {string} path directory path
     * @memberof Env
     */
    constructor(path: string = '.') {
        if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'
        this.path = path
    }

    /**
     * Load file to env.
     * @param {string} path file path
     * @memberof Env
     */
    public loadFile(path: string): Boolean {
        const { error } = dotenv.config({ path, override: true })
        if (error) console.error(`Failed to load ${path}`)
        return !error
    }

    /**
     * Load '.env' file and '.env.{NODE_ENV}' file.
     * ! depends on the path
     * @memberof Env
     */
    public loadEnv() {
        return this.loadFile(`${this.path}/.env`) && this.loadFile(`${this.path}/.env.${process.env.NODE_ENV}`)
    }
}
