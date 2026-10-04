import express from 'express';
import {
  getReviewQueue,
  processReview,
} from '../controllers/reviewController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { reviewActionSchema } from '../validations/schemas.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('REVIEWER', 'ADMIN'));

router.get('/queue', getReviewQueue);
router.post('/:id/process', validate(reviewActionSchema), processReview);

export default router;
