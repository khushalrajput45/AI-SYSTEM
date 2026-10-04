import { CampusZone } from '../models/CampusZone.js';
import { resolveCampusZone } from '../services/geofenceService.js';

export async function getCampusZones(req, res, next) {
  try {
    const zones = await CampusZone.find({}).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: zones.length,
      zones,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkGeofence(req, res, next) {
  try {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude query parameters are required.',
      });
    }

    const result = await resolveCampusZone(parseFloat(latitude), parseFloat(longitude));
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (err) {
    next(err);
  }
}
