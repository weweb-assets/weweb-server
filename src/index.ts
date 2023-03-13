import cluster from 'cluster'
import { cpus } from 'os'
import { env } from './config'
env.loadEnv()
import { server } from './core'


if (cluster.isPrimary && process.env.WW_ENV !== 'local' && process.env.MULTI_THREAD) {
    for (let i = 0; i < cpus().length - 1; i++) cluster.fork()
}

server.run()
