import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'REVIEWER', 'STAFF', 'ADMIN']).default('STUDENT'),
  department: z.string().optional(),
  studentId: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const submitComplaintSchema = z.object({
  description: z.string().min(5, 'Please provide a clear description of the issue'),
  locationDetail: z.string().optional(),
  latitude: z.coerce.number({ required_error: 'Latitude is required' }),
  longitude: z.coerce.number({ required_error: 'Longitude is required' }),
  accuracy: z.coerce.number().optional().default(5),
});

export const reviewActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'MERGE']),
  finalCategory: z.string().optional(),
  finalSeverity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedDepartment: z.string().optional(),
  targetIncidentId: z.string().optional(),
  reviewerNotes: z.string().optional(),
});

export const updateIncidentStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  note: z.string().optional(),
  resolutionNotes: z.string().optional(),
});
