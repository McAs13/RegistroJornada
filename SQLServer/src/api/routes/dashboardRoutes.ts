import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import container from '../serverContainer';

const router = Router();
const controller = new DashboardController(container.dashboardService);

router.get('/summary', controller.summary);

export default router;
