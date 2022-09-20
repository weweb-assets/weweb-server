import * as bodyParser from 'body-parser'
import cors from 'cors'
import * as express from 'express'
import morgan from 'morgan'
import routes from '../routes'
import { log } from '../services'
import * as Sentry from '@sentry/node'
import cookieParser from 'cookie-parser'
const wwmt = require('weweb-microservice-token')

/**
 * Application core.
 * @export
 * @class App
 */
export default class App {
    /** Express application. */
    public readonly app: express.Application

    /**
     * Creates an instance of App.
     * Initialize app config.
     * Initialize routes.
     * @memberof App
     */
    constructor() {
        // init express app
        this.app = express.default()
        // init config
        this.config()
        // init route
        routes(this.app)
        // init microservice
        this.initMicroservices()
        // catch all errors
        this.catchErrors()
    }

    /**
     * Initialize configuration.
     * @private
     * @memberof App
     */
    private config() {
        // middleware on all routes
        this.app.use(cors())
        this.app.use(bodyParser.json({ limit: '20mb' }))
        this.app.use(express.urlencoded({ extended: true, limit: '20mb' }))
        this.app.use(cookieParser())
        // set port in app express
        this.app.set('port', process.env.PORT || '8080')
        // init development config
        /* istanbul ignore if */
        if (process.env.NODE_ENV === 'development') this.devConfig()
    }

    /**
     * Initialize development configuration.
     * @private
     * @memberof App
     */
    /* istanbul ignore next */
    private devConfig() {
        this.app.use(
            morgan((tokens, req, res) => {
                log.printRequest(tokens.method(req, res), tokens.url(req, res), parseInt(tokens['response-time'](req, res)), tokens.status(req, res))
                return undefined
            })
        )
    }

    /**
     * Init microservices
     * @private
     * @memberof App
     */
    private initMicroservices() {
        if (process.env.PUBLIC_KEY && process.env.PRIVATE_KEY) {
            wwmt.init({
                name: process.env.PUBLIC_KEY,
                seed: process.env.PRIVATE_KEY,
                allowedServices: [
                    {
                        name: process.env.PUBLIC_KEY,
                        seed: process.env.PRIVATE_KEY,
                    },
                ],
            })
        } else if (process.env.WW_SEED_PREVIEW) {
            wwmt.init({
                name: 'weweb-preview',
                seed: process.env.WW_SEED_PREVIEW,
                allowedServices: [
                    {
                        name: 'weweb-back',
                        seed: process.env.WW_SEED_BACK,
                    },
                    {
                        name: 'weweb-publisher',
                        seed: process.env.WW_SEED_PUBLISHER,
                    },
                    {
                        name: 'weweb-plugins',
                        seed: process.env.WW_SEED_PLUGINS,
                    },
                ],
            })
        } else {
            log.error('PUBLIC_KEY and PRIVATE_KEY not set')
            wwmt.init({
                name: 'empty',
                seed: 'empty',
                allowedServices: [],
            })
        }
    }

    /**
     * Catch all errors
     * @private
     * @memberof App
     */
    private catchErrors() {
        if (process.env.WW_ENV && process.env.NODE_ENV === 'production') {
            Sentry.init({
                dsn: 'https://02345bc87d4845e894fc09d5300fcc15@o513521.ingest.sentry.io/5615870',
                tracesSampleRate: 1.0,
                environment: process.env.WW_ENV || 'prod',
            })
        }
        this.app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
            log.error(err)
            if (process.env.WW_ENV) Sentry.captureException(err)
            return res.status(500).send({ success: false, code: 'INTERNAL_ERROR' })
        })
        process.on('uncaughtException', function (err) {
            log.error(err)
            if (process.env.WW_ENV) Sentry.captureException(err)
        })
    }
}
