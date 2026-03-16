import { Router } from 'express';
import { ServicePackAdminController } from '../controllers/admin/servicePackAdminController';

const router = Router();

router.get('/', ServicePackAdminController.list);
router.post('/', ServicePackAdminController.create);
router.patch('/:id', ServicePackAdminController.update);
router.delete('/:id', ServicePackAdminController.remove);

export default router;

