import { Application } from 'express'
import * as http from 'http'
import { db } from '.'
import { log } from '../services'
import { website as websiteCore } from '../core'

/**
 * Server core.
 * @export
 * @class Server
 */
export default class Server {
    /** Express application. */
    public readonly app: Application
    /** Http server. */
    public readonly server: http.Server

    /**
     * Creates an instance of Server.
     * @param {Application} app
     * @memberof Server
     */
    constructor(app: Application) {
        this.app = app
        this.server = http.createServer(this.app)
    }

    /**
     * Run database and server.
     * @memberof Server
     */
    public async run() {
        await db.run()
        websiteCore.testFiles()

        this.server.listen(this.app.get('port'), () => {
            log.printWeweb()
            log.printServerInfo()
        })
    }

    /**
     * Stop server.
     * @memberof Server
     */
    public async close() {
        this.server.close()
    }
}
