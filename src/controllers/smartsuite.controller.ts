import { Request, Response, NextFunction } from 'express'
import { RequestWebsite } from 'ww-request'
import { db } from '../core'
import { utils, log } from '../services'
const wwmt = require('weweb-microservice-token')

const SMARTSUITE_PLUGIN_ID = '3e92b92c-ecab-4b06-b387-c891ae1f5e4e'

