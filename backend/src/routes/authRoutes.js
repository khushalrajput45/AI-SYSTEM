import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  demoLogin,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { registerSchema, loginSchema } from '../validations/schemas.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.post('/demo-login', demoLogin);

export default router;
