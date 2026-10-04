import express from 'express';
import {
  getAdminAnalytics,
  getCampusHeatmapData,
  getAuditLogs,
  getUsersAndDepartments,
} from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'REVIEWER'));

router.get('/analytics', getAdminAnalytics);
router.get('/heatmap', getCampusHeatmapData);
router.get('/audit-logs', getAuditLogs);
router.get('/system-users', authorizeRoles('ADMIN'), getUsersAndDepartments);

export default router;
