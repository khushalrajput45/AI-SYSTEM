import express from 'express';
import {
  getMyNotifications,
  markAsRead,
  clearAllNotifications,
} from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/clear', clearAllNotifications);
router.delete('/all', clearAllNotifications);

export default router;
