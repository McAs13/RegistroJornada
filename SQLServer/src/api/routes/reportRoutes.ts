import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import container from '../serverContainer';

const router = Router();
const controller = new ReportController(container.reportService);

router.get('/csv', controller.exportCsv);

export default router;
