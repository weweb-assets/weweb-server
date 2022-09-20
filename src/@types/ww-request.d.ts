import { Request } from 'express'
import { designVersion, page } from '../models'

export interface RequestWebsite extends Request {
    designVersion: designVersion.DesignVersion
    page: page.Page
    isIndexHtml: Boolean
    isPrivate: Boolean
}
