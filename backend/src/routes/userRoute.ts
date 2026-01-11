import { Router } from 'express';
import { registerUser, loginUser, updateUserProfileController, searchUsers, updateUserByAdmin, deleteUserByAdmin } from '../controllers/userController';

const router: Router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', updateUserProfileController);
router.get('/users', searchUsers);
router.put('/users', updateUserByAdmin);
router.delete('/users', deleteUserByAdmin);

export default router;