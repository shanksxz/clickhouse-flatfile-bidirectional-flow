import { Router } from 'express'
import { ingestionController } from '../controller/ingestion.controller'

const router = Router()

router.post('/validate-connection', ingestionController.validateConnection)
router.post('/tables', ingestionController.getTables)
router.post('/schema', ingestionController.getTableSchema)
router.post('/columns', ingestionController.getColumns)
router.post('/preview', ingestionController.previewData)
router.post('/transfer', ingestionController.startTransfer)
router.post('/insert', ingestionController.insertData)
router.post('/export', ingestionController.exportToFlatFile)

export default router