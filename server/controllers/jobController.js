const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/jobs
const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    skills,
    page = 1,
    limit = 10,
    sort = 'latest'
  } = req.query;

  const query = { status: 'open' };

  if (search) {
    query.$text = { $search: search };
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (jobType) {
    query.jobType = jobType;
  }

  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  if (salaryMin) {
    query['salary.min'] = { $gte: Number(salaryMin) };
  }

  if (salaryMax) {
    query['salary.max'] = { $lte: Number(salaryMax) };
  }

  if (skills) {
    const skillList = skills.split(',').map(s => s.trim());
    query.skills = { $in: skillList };
  }

  let sortQuery = { createdAt: -1 };
  if (sort === 'salary') {
    sortQuery = { 'salary.max': -1 };
  } else if (sort === 'relevance' && search) {
    sortQuery = { score: { $meta: 'textScore' } };
  }

  const skipIndex = (parseInt(page) - 1) * parseInt(limit);
  const total = await Job.countDocuments(query);
  
  const jobs = await Job.find(query)
    .populate('companyId', 'companyName logo location industry size')
    .sort(sortQuery)
    .limit(parseInt(limit))
    .skip(skipIndex);

  return successResponse(res, 200, 'Jobs list retrieved successfully', {
    jobs,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  });
});

// GET /api/jobs/:id
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('companyId', 'companyName logo location size industry website about');

  if (!job) {
    return errorResponse(res, 404, 'Job not found');
  }

  job.views += 1;
  await job.save();

  let isApplied = false;
  let isSaved = false;

  if (req.user && req.user.role === 'candidate') {
    const applied = await Application.findOne({ jobId: job._id, candidateId: req.user.id });
    if (applied) {
      isApplied = true;
    }

    const saved = await SavedJob.findOne({ jobId: job._id, candidateId: req.user.id });
    if (saved) {
      isSaved = true;
    }
  }

  return successResponse(res, 200, 'Job detail retrieved', {
    job,
    isApplied,
    isSaved
  });
});

module.exports = {
  getJobs,
  getJobById
};
