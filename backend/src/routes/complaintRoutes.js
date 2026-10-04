import express from 'express';
import {
  submitComplaint,
  getMyComplaints,
  getComplaintById,
} from '../controllers/complaintController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Student creates complaint with live camera photo
router.post(
  '/',
  authorizeRoles('STUDENT', 'ADMIN'),
  upload.single('evidence'),
  submitComplaint
);

// Student gets their complaints
router.get('/my', authorizeRoles('STUDENT', 'ADMIN'), getMyComplaints);

// Get single complaint by ID
router.get('/:id', getComplaintById);

export default router;
