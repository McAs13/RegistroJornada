import { Router } from 'express';
import { EmployeeController } from '../controllers/EmployeeController';
import container from '../serverContainer';

const router = Router();
const controller = new EmployeeController(container.employeeService);

router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
