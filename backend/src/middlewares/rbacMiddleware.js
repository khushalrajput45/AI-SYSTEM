/**
 * Role-Based Access Control (RBAC) middleware
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User context missing.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
}

/**
 * Department-level authorization middleware for Staff
 */
export function authorizeDepartment(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  // Admin and Reviewer can access all departments
  if (req.user.role === 'ADMIN' || req.user.role === 'REVIEWER') {
    return next();
  }

  if (req.user.role === 'STAFF') {
    if (!req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Staff account has no assigned department.',
      });
    }
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access restricted to authorized staff.',
  });
}
