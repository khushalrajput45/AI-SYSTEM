import express from 'express';
import { Department } from '../models/Department.js';

const router = express.Router();

// Public endpoint: Fetch all active campus departments
router.get('/', async (req, res, next) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
