import { Router } from 'express';
import { addFloorPlan, getFloorPlan, updateFloorPlans } from '../controllers/floorPlanController';

const router = Router();

router.post('/add', addFloorPlan);
router.get('/:floorId', getFloorPlan);
router.put('/:floorId', updateFloorPlans);

export default router;