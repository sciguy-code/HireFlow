const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const Company = require('../models/Company');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, errors.array()[0].msg);
  }

  const { name, email, password, role } = req.body;

  if (!['candidate', 'recruiter'].includes(role)) {
    return errorResponse(res, 400, 'Invalid role. Must be candidate or recruiter');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 400, 'Email is already registered');
  }

  const user = new User({ name, email, password, role });
  await user.save();

  if (role === 'recruiter') {
    const company = new Company({
      recruiterId: user._id,
      companyName: `${name}'s Company`
    });
    await company.save();
  } else if (role === 'candidate') {
    const candidateProfile = new CandidateProfile({
      userId: user._id
    });
    await candidateProfile.save();
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return successResponse(res, 201, 'User registered successfully', {
    accessToken,
    user: userObj
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, errors.array()[0].msg);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  if (user.isBlocked) {
    return errorResponse(res, 403, 'Your account has been suspended by the administrator');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return successResponse(res, 200, 'Logged in successfully', {
    accessToken,
    user: userObj
  });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = '';
      await user.save();
    }
  }

  res.clearCookie('refreshToken');
  return successResponse(res, 200, 'Logged out successfully');
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshToken');
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  let profile = null;
  if (user.role === 'candidate') {
    profile = await CandidateProfile.findOne({ userId: user._id });
  } else if (user.role === 'recruiter') {
    profile = await Company.findOne({ recruiterId: user._id });
  }

  return successResponse(res, 200, 'Current user data retrieved', {
    user: {
      ...user.toObject(),
      profile
    }
  });
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return errorResponse(res, 401, 'No refresh token provided');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 401, 'Invalid refresh token');
    }

    if (user.isBlocked) {
      return errorResponse(res, 403, 'Your account has been suspended by the administrator');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    return successResponse(res, 200, 'Access token refreshed', { accessToken });
  } catch (error) {
    return errorResponse(res, 401, 'Refresh token is expired or invalid');
  }
});

module.exports = {
  register,
  login,
  logout,
  me,
  refresh
};
