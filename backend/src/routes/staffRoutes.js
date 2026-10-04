import express from 'express';
import {
  getDepartmentIncidents,
  acceptIncident,
  updateProgress,
  resolveIncident,
} from '../controllers/staffController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles, authorizeDepartment } from '../middlewares/rbacMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('STAFF', 'ADMIN'));
router.use(authorizeDepartment);

router.get('/incidents', getDepartmentIncidents);
router.patch('/incidents/:id/accept', acceptIncident);
router.patch('/incidents/:id/progress', updateProgress);
router.post('/incidents/:id/resolve', upload.single('afterEvidence'), resolveIncident);

export default router;
