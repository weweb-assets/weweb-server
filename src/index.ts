import { env } from './config'
env.loadEnv()

import { server } from './core'
server.run()
