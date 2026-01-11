import { Router, Request, Response } from 'express';
import { routeTest } from '../controllers/testController';

const router: Router = Router();

router.post('/test', routeTest);

export default router;