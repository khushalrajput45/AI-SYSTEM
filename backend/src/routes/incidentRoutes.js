import express from 'express';
import {
  getAllIncidents,
  getIncidentById,
} from '../controllers/incidentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllIncidents);
router.get('/:id', getIncidentById);

export default router;
