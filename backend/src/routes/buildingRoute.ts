import { Router } from 'express';
import { addBuilding, addFloor, getBuildingsAndFloors, updateBuilding, updateFloor, deleteBuilding, deleteFloor } from '../controllers/buildingController';

const router: Router = Router();

router.post('/buildings', addBuilding);
router.post('/floors', addFloor);
router.put('/buildings', updateBuilding);
router.put('/floors', updateFloor);
router.delete('/buildings', deleteBuilding);
router.delete('/floors', deleteFloor);
router.get('/buildings', getBuildingsAndFloors);

export default router;