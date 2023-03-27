import cluster from 'cluster'
import { cpus } from 'os'
import { env } from './config'
env.loadEnv()
import { server } from './core'

if (cluster.isPrimary && process.env.WW_ENV !== 'local') {
    for (const _ of cpus()) cluster.fork()
} else {
    server.run()
}
