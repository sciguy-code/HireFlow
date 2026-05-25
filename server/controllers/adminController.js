const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  sendEmail,
  recruiterWelcomeTemplate,
  accountSuspensionTemplate
} = require('../utils/sendEmail');

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const totalCandidates = await User.countDocuments({ role: 'candidate' });
  const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });

  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
  const newJobsThisWeek = await Job.countDocuments({ createdAt: { $gte: oneWeekAgo } });

  const applicationRate = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0;

  // New users per day for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usersPerDay = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Format array to { date, count } for charts
  const usersChartData = usersPerDay.map(item => ({
    date: item._id,
    count: item.count
  }));

  // Top companies by applicant count
  const topCompanies = await Application.aggregate([
    {
      $lookup: {
        from: 'jobs',
        localField: 'jobId',
        foreignField: '_id',
        as: 'job'
      }
    },
    { $unwind: '$job' },
    {
      $lookup: {
        from: 'companies',
        localField: 'job.companyId',
        foreignField: '_id',
        as: 'company'
      }
    },
    { $unwind: '$company' },
    {
      $group: {
        _id: '$company._id',
        companyName: { $first: '$company.companyName' },
        applicants: { $sum: 1 }
      }
    },
    { $sort: { applicants: -1 } },
    { $limit: 5 }
  ]);

  // Top jobs by views
  const topJobs = await Job.find()
    .select('title views')
    .sort({ views: -1 })
    .limit(5);

  return successResponse(res, 200, 'Admin platform statistics retrieved', {
    users: {
      candidates: totalCandidates,
      recruiters: totalRecruiters,
      admins: totalAdmins,
      total: totalCandidates + totalRecruiters + totalAdmins
    },
    jobs: totalJobs,
    applications: totalApplications,
    newUsersThisWeek,
    newJobsThisWeek,
    applicationRate: parseFloat(applicationRate),
    usersChartData,
    topCompanies,
    topJobs
  });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { role, isBlocked, search, page = 1, limit = 10 } = req.query;
  const query = {};

  if (role) {
    query.role = role;
  }

  if (isBlocked) {
    query.isBlocked = isBlocked === 'true';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skipIndex = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skipIndex);

  return successResponse(res, 200, 'User list retrieved', {
    users,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  });
});

// GET /api/admin/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }
  return successResponse(res, 200, 'User details retrieved', user);
});

// PATCH /api/admin/users/:id/block
const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  user.isBlocked = !user.isBlocked;

  if (user.isBlocked) {
    user.refreshToken = ''; // Invalidate refresh token
    // Send account suspension email
    await sendEmail({
      to: user.email,
      subject: 'Account Suspended - HireFlow Support',
      html: accountSuspensionTemplate(user.name)
    });
  }

  await user.save();
  return successResponse(res, 200, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user);
});

// PATCH /api/admin/users/:id/approve
const approveRecruiter = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return errorResponse(res, 404, 'User not found');
  }

  if (user.role !== 'recruiter') {
    return errorResponse(res, 400, 'Only recruiter accounts can be approved');
  }

  user.isApproved = !user.isApproved;
  await user.save();

  if (user.isApproved) {
    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Account Approved - Welcome to HireFlow',
      html: recruiterWelcomeTemplate(user.name)
    });
  }

  return successResponse(res, 200, `Recruiter account ${user.isApproved ? 'approved' : 'unapproved'} successfully`, user);
});

// GET /api/admin/jobs
const getAdminJobs = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const skipIndex = (parseInt(page) - 1) * parseInt(limit);
  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('companyId', 'companyName industry location')
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skipIndex);

  return successResponse(res, 200, 'Jobs list retrieved for admin', {
    jobs,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  });
});

// PATCH /api/admin/jobs/:id/status
const moderateJob = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['open', 'closed', 'draft'];

  if (!status || !validStatuses.includes(status)) {
    return errorResponse(res, 400, 'Invalid job status');
  }

  const job = await Job.findById(req.params.id);
  if (!job) {
    return errorResponse(res, 404, 'Job not found');
  }

  job.status = status;
  await job.save();

  return successResponse(res, 200, `Job status updated to ${status} by admin`, job);
});

// DELETE /api/admin/jobs/:id
const deleteJobByAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) {
    return errorResponse(res, 404, 'Job not found');
  }
  // Remove applications for this job
  await Application.deleteMany({ jobId: req.params.id });
  return successResponse(res, 200, 'Job posting deleted by admin successfully');
});

// GET /api/admin/applications
const getAdminApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skipIndex = (parseInt(page) - 1) * parseInt(limit);

  const total = await Application.countDocuments();
  const applications = await Application.find()
    .populate('jobId', 'title')
    .populate('candidateId', 'name email')
    .sort({ appliedAt: -1 })
    .limit(parseInt(limit))
    .skip(skipIndex);

  return successResponse(res, 200, 'Applications list retrieved for admin', {
    applications,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  });
});

module.exports = {
  getStats,
  getUsers,
  getUserById,
  blockUser,
  approveRecruiter,
  getAdminJobs,
  moderateJob,
  deleteJobByAdmin,
  getAdminApplications
};
