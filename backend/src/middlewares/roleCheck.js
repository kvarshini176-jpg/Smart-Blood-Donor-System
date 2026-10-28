/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {string[]} allowedRoles - Array of allowed role names (e.g. ['DONOR'], ['HOSPITAL'], ['ADMIN'])
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before verifying role.'
      });
    }

    const userRole = req.user.role.toUpperCase();
    const authorized = allowedRoles.map(r => r.toUpperCase()).includes(userRole);

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. You do not have permissions to perform this action. Required: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

module.exports = requireRole;
