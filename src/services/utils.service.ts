import { Request } from 'express'

/**
 * Utils service.
 * @export
 * @class Utils
 */
export default class Utils {
    /**
     * Check if all elements are defined.
     * @param {[any]} objects
     * @returns {boolean}
     * @memberof Utils
     */
    public isDefined(objects: Array<any>): boolean {
        for (const i in objects) {
            if (typeof objects[i] === 'undefined' || objects[i] == 'null' || objects[i] === 'undefined') return false
        }
        return true
    }

    /**
     * Clone object
     * @param {object} object
     * @returns {object}
     * @memberof Utils
     */
    public cloneObject(object: object): object {
        if (!this.isDefined([object])) return undefined
        return JSON.parse(JSON.stringify(object))
    }

    /**
     * Create an unique id.
     * @returns {number}
     * @memberof Utils
     */
    public getUniqueId(): number {
        const d = new Date()
        return Math.floor((d.getTime() * Math.random() + Math.random() * 10000 + Math.random() * 100) / 100)
    }

    /**
     * Get cookies in request
     * @param {Request} req
     * @returns
     * @memberof Utils
     */
    public getCookies(req: Request): any {
        const cookies = {} as any
        req.headers &&
            req.headers.cookie &&
            req.headers.cookie.split(';').forEach(function (cookie) {
                const parts = cookie.match(/(.*?)=(.*)$/)
                cookies[parts[1].trim()] = (parts[2] || '').trim()
            })
        return cookies
    }

    /**
     * Get cookie in request by name
     * @param {Request} req
     * @param {string} name
     * @returns {string}
     * @memberof Utils
     */
    public getCookie(req: Request, name: string): string | null {
        const cookies = this.getCookies(req)
        return cookies[name] || null
    }

    /**
     * Get server path.
     * @returns {string}
     * @memberof Utils
     */
    public getServerPath(): string {
        if (!process.env.SERVER_PATH) {
            return ''
        }

        let serverPath = process.env.SERVER_PATH
        if (!serverPath.startsWith('/')) serverPath = '/' + serverPath
        if (serverPath.endsWith('/')) serverPath = serverPath.slice(0, -1)
        return serverPath
    }
}
