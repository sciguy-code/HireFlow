const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  sendEmail,
  statusUpdateTemplate,
  interviewScheduledTemplate
} = require('../utils/sendEmail');
const socketHandler = require('../socket/socket');

// GET /api/recruiter/company
const getCompany = asyncHandler(async (req, res) => {
  let company = await Company.findOne({ recruiterId: req.user.id });
  if (!company) {
    company = new Company({
      recruiterId: req.user.id,
      companyName: 'My Company'
    });
    await company.save();
  }
  return successResponse(res, 200, 'Company profile retrieved', company);
});

// PUT /api/recruiter/company
const updateCompany = asyncHandler(async (req, res) => {
  const { companyName, website, about, industry, location, size } = req.body;
  let company = await Company.findOne({ recruiterId: req.user.id });

  if (!company) {
    company = new Company({ recruiterId: req.user.id });
  }

  company.companyName = companyName || company.companyName;
  company.website = website !== undefined ? website : company.website;
  company.about = about !== undefined ? about : company.about;
  company.industry = industry !== undefined ? industry : company.industry;
  company.location = location !== undefined ? location : company.location;
  company.size = size || company.size;

  await company.save();
  return successResponse(res, 200, 'Company profile updated', company);
});

// POST /api/recruiter/company/logo
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'Please upload a logo file');
  }

  let company = await Company.findOne({ recruiterId: req.user.id });
  if (!company) {
    return errorResponse(res, 404, 'Company not found');
  }

  if (company.logoPublicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'mock') {
    try {
      await cloudinary.uploader.destroy(company.logoPublicId);
    } catch (err) {
      console.warn('Failed to delete old logo from Cloudinary:', err.message);
    }
  }

  let logoUrl = '';
  let logoPublicId = '';

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'mock') {
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'logos' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });
    };
    const result = await uploadStream();
    logoUrl = result.secure_url;
    logoPublicId = result.public_id;
  } else {
    logoUrl = `https://res.cloudinary.com/mock/image/upload/logos/logo_${req.user.id}_${Date.now()}.png`;
    logoPublicId = `logo_${req.user.id}_${Date.now()}`;
  }

  company.logo = logoUrl;
  company.logoPublicId = logoPublicId;
  await company.save();

  return successResponse(res, 200, 'Company logo uploaded successfully', company);
});

// GET /api/recruiter/jobs
const getMyJobs = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { postedBy: req.user.id };

  if (status) {
    query.status = status;
  }

  const skipIndex = (parseInt(page) - 1) * parseInt(limit);
  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skipIndex);

  return successResponse(res, 200, 'Recruiter jobs retrieved', {
    jobs,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit))
  });
});

// POST /api/recruiter/jobs
const createJob = asyncHandler(async (req, res) => {
  const { title, description, requirements, skills, salary, jobType, location, experienceLevel, deadline } = req.body;
  
  const company = await Company.findOne({ recruiterId: req.user.id });
  if (!company) {
    return errorResponse(res, 400, 'Please set up your company profile first');
  }

  const job = new Job({
    companyId: company._id,
    postedBy: req.user.id,
    title,
    description,
    requirements,
    skills,
    salary,
    jobType,
    location,
    experienceLevel,
    deadline
  });

  await job.save();
  return successResponse(res, 201, 'Job posted successfully', job);
});

// GET /api/recruiter/jobs/:id
const getJobDetail = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user.id });
  if (!job) {
    return errorResponse(res, 404, 'Job not found');
  }
  return successResponse(res, 200, 'Job detail retrieved', job);
});

// PUT /api/recruiter/jobs/:id
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user.id });
  if (!job) {
    return errorResponse(res, 404, 'Job not found or unauthorized');
  }

  const fields = ['title', 'description', 'requirements', 'skills', 'salary', 'jobType', 'location', 'experienceLevel', 'deadline', 'status'];
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  await job.save();
  return successResponse(res, 200, 'Job updated successfully', job);
});

// DELETE /api/recruiter/jobs/:id
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user.id });
  if (!job) {
    return errorResponse(res, 404, 'Job not found or unauthorized');
  }
  await Application.deleteMany({ jobId: req.params.id });
  return successResponse(res, 200, 'Job deleted successfully');
});

// GET /api/recruiter/jobs/:id/applicants
const getApplicants = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const job = await Job.findOne({ _id: req.params.id, postedBy: req.user.id });
  if (!job) {
    return errorResponse(res, 404, 'Job not found or unauthorized');
  }

  const query = { jobId: req.params.id };
  if (status) {
    query.status = status;
  }

  const applicants = await Application.find(query)
    .populate('candidateId', 'name email profilePhoto')
    .sort({ appliedAt: -1 });

  const applicantsWithProfile = await Promise.all(
    applicants.map(async (app) => {
      const profile = await CandidateProfile.findOne({ userId: app.candidateId._id });
      return {
        ...app.toObject(),
        candidateProfile: profile
      };
    })
  );

  return successResponse(res, 200, 'Applicants list retrieved', applicantsWithProfile);
});

// GET /api/recruiter/applicants/:applicationId
const getApplicantDetail = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.applicationId)
    .populate('jobId')
    .populate('candidateId', 'name email profilePhoto');

  if (!app) {
    return errorResponse(res, 404, 'Application not found');
  }

  if (app.jobId.postedBy.toString() !== req.user.id) {
    return errorResponse(res, 403, 'Unauthorized access to applicant details');
  }

  const profile = await CandidateProfile.findOne({ userId: app.candidateId._id });

  return successResponse(res, 200, 'Applicant detail retrieved', {
    ...app.toObject(),
    candidateProfile: profile
  });
});

// PATCH /api/recruiter/applicants/:applicationId/status
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, recruiterNote, interviewDate } = req.body;
  const validStatuses = ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected'];

  if (!status || !validStatuses.includes(status)) {
    return errorResponse(res, 400, 'Invalid status code');
  }

  const app = await Application.findById(req.params.applicationId)
    .populate('jobId')
    .populate('candidateId', 'name email');

  if (!app) {
    return errorResponse(res, 404, 'Application not found');
  }

  if (app.jobId.postedBy.toString() !== req.user.id) {
    return errorResponse(res, 403, 'Unauthorized access to update status');
  }

  app.status = status;
  if (recruiterNote !== undefined) {
    app.recruiterNote = recruiterNote;
  }
  await app.save();

  // Create real-time notification
  const notificationMsg = `Your application status for "${app.jobId.title}" has been updated to "${status}".`;
  const notification = new Notification({
    userId: app.candidateId._id,
    message: notificationMsg,
    type: 'status',
    link: `/candidate/applications`
  });
  await notification.save();

  // Emit event via Socket
  if (socketHandler && socketHandler.emitToUser) {
    socketHandler.emitToUser(app.candidateId._id.toString(), 'notification', notification);
    socketHandler.emitToUser(app.candidateId._id.toString(), 'application_update', {
      applicationId: app._id,
      newStatus: status,
      jobTitle: app.jobId.title
    });
  }

  // Send Email Update
  let emailHtml = '';
  if (status === 'interview') {
    const defaultDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow
    const finalDate = interviewDate ? new Date(interviewDate) : defaultDate;
    emailHtml = interviewScheduledTemplate(app.candidateId.name, app.jobId.title, finalDate);
    await sendEmail({
      to: app.candidateId.email,
      subject: `Interview Invitation: ${app.jobId.title} at HireFlow`,
      html: emailHtml
    });
  } else {
    emailHtml = statusUpdateTemplate(app.candidateId.name, app.jobId.title, status);
    await sendEmail({
      to: app.candidateId.email,
      subject: `Application Update: ${app.jobId.title} at HireFlow`,
      html: emailHtml
    });
  }

  return successResponse(res, 200, 'Application status updated successfully', app);
});

// GET /api/recruiter/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user.id });
  const jobIds = jobs.map(j => j._id);

  const totalJobs = jobs.length;
  const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });
  const totalShortlisted = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'shortlisted' });
  const shortlistRate = totalApplicants > 0 ? ((totalShortlisted / totalApplicants) * 100).toFixed(1) : 0;

  // Applications per job
  const appsPerJob = await Promise.all(
    jobs.map(async (job) => {
      const count = await Application.countDocuments({ jobId: job._id });
      return {
        title: job.title,
        applicants: count
      };
    })
  );

  // Status distribution
  const statuses = ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected'];
  const statusDist = {};
  for (const s of statuses) {
    statusDist[s] = await Application.countDocuments({ jobId: { $in: jobIds }, status: s });
  }

  // Views per job
  const viewsPerJob = jobs.map(j => ({
    title: j.title,
    views: j.views
  }));

  return successResponse(res, 200, 'Recruiter analytics data retrieved', {
    totalJobs,
    totalApplicants,
    shortlistRate: parseFloat(shortlistRate),
    applicationsPerJob: appsPerJob,
    statusDistribution: statusDist,
    viewsPerJob
  });
});

module.exports = {
  getCompany,
  updateCompany,
  uploadLogo,
  getMyJobs,
  createJob,
  getJobDetail,
  updateJob,
  deleteJob,
  getApplicants,
  getApplicantDetail,
  updateApplicationStatus,
  getAnalytics
};
