const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Unauthorized access, insufficient permissions');
    }
    next();
  };
};

const requireApproved = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required');
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    if (user.role === 'recruiter' && !user.isApproved) {
      return errorResponse(res, 403, 'Your account is pending admin approval');
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorize,
  requireApproved
};
