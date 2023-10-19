import { Request } from 'express'
import { design, designVersion, page } from '../models'

export interface RequestWebsite extends Request {
    designVersion: designVersion.DesignVersion
    design: design.Design
    page: page.Page
    isIndexHtml: Boolean
    isPrivate: Boolean
    finalHost: string
    is404: Boolean
    lastModified: Date
}
