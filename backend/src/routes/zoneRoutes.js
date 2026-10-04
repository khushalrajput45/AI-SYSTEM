import express from 'express';
import {
  getCampusZones,
  checkGeofence,
} from '../controllers/zoneController.js';

const router = express.Router();

router.get('/', getCampusZones);
router.get('/check', checkGeofence);

export default router;
