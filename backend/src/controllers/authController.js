import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { ENV } from '../config/env.js';
import { logAuditEvent } from '../services/auditService.js';

function generateToken(userId) {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
}

function sendAuthResponse(res, user, statusCode = 200, message = 'Success') {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      phone: user.phone,
      avatar: user.avatar,
    },
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'STUDENT', department, studentId, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let departmentId = null;
    if (role === 'STAFF' && department) {
      const dept = await Department.findOne({
        $or: [{ _id: department.match(/^[0-9a-fA-F]{24}$/) ? department : null }, { code: department.toUpperCase() }],
      });
      if (dept) departmentId = dept._id;
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      department: departmentId,
      studentId: studentId || (role === 'STUDENT' ? `STU-${Math.floor(1000 + Math.random() * 9000)}` : null),
      phone,
    });

    await user.save();

    await logAuditEvent({
      action: 'USER_REGISTERED',
      entityType: 'AUTH',
      entityId: user._id,
      entityIdentifier: user.email,
      performedBy: user._id,
      performedByName: user.name,
      performedByRole: user.role,
      details: { role: user.role },
      ipAddress: req.ip,
    });

    const populatedUser = await User.findById(user._id).populate('department');
    return sendAuthResponse(res, populatedUser, 201, 'User registered successfully.');
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).populate('department');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    await logAuditEvent({
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user._id,
      entityIdentifier: user.email,
      performedBy: user._id,
      performedByName: user.name,
      performedByRole: user.role,
      details: { role: user.role },
      ipAddress: req.ip,
    });

    return sendAuthResponse(res, user, 200, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}

/**
 * 1-Click Demo Login for quick role switching during presentations/demos
 */
export async function demoLogin(req, res, next) {
  try {
    const { role = 'STUDENT', deptCode = 'IT' } = req.body;

    let query = { role: role.toUpperCase() };
    if (role.toUpperCase() === 'STAFF') {
      const dept = await Department.findOne({ code: deptCode.toUpperCase() });
      if (dept) {
        query.department = dept._id;
      }
    }

    let user = await User.findOne(query).populate('department');

    if (!user) {
      // Fallback to any user with that role
      user = await User.findOne({ role: role.toUpperCase() }).populate('department');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo user for role ${role} not found. Please run seed script.`,
      });
    }

    await logAuditEvent({
      action: 'DEMO_QUICK_LOGIN',
      entityType: 'AUTH',
      entityId: user._id,
      entityIdentifier: user.email,
      performedBy: user._id,
      performedByName: user.name,
      performedByRole: user.role,
      details: { demoRole: role },
      ipAddress: req.ip,
    });

    return sendAuthResponse(res, user, 200, `Switched to ${role} demo profile.`);
  } catch (err) {
    next(err);
  }
}
