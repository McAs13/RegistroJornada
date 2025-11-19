import { Router } from 'express';
import { SedeController } from '../controllers/SedeController';
import container from '../serverContainer';

const router = Router();
const controller = new SedeController(container.sedeService);

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
