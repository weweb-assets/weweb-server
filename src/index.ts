import cluster from 'cluster'
import { cpus } from 'os'
import { env } from './config'
env.loadEnv()
import { server } from './core'


if (cluster.isPrimary && process.env.WW_ENV !== 'local' && process.env.MULTI_THREAD) {
    for (let i = 0; i < cpus().length; i++) cluster.fork({ FORK_ID: `${i}` })
} else {
    console.log('FORK_ID')
    console.log(process.env.FORK_ID)
    server.run()
}
