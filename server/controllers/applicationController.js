const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmail, applicationReceivedTemplate } = require('../utils/sendEmail');
const socketHandler = require('../socket/socket');

// POST /api/applications
const apply = asyncHandler(async (req, res) => {
  const { jobId, coverLetter } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    return errorResponse(res, 404, 'Job not found');
  }

  if (job.status !== 'open') {
    return errorResponse(res, 400, 'This job posting is no longer open');
  }

  if (new Date(job.deadline) < new Date()) {
    return errorResponse(res, 400, 'The application deadline for this job has passed');
  }

  const existingApp = await Application.findOne({ jobId, candidateId: req.user.id });
  if (existingApp) {
    return errorResponse(res, 400, 'You have already applied for this job');
  }

  const profile = await CandidateProfile.findOne({ userId: req.user.id });
  if (!profile || !profile.resumeUrl) {
    return errorResponse(res, 400, 'Please upload a resume in your profile before applying');
  }

  const application = new Application({
    jobId,
    candidateId: req.user.id,
    resumeUrl: profile.resumeUrl,
    resumePublicId: profile.resumePublicId,
    coverLetter: coverLetter || ''
  });

  await application.save();

  job.applicantCount += 1;
  await job.save();

  const candidate = await User.findById(req.user.id);
  const recruiterId = job.postedBy.toString();

  // Create notification for recruiter
  const notification = new Notification({
    userId: recruiterId,
    message: `${candidate.name} applied for "${job.title}"`,
    type: 'application',
    link: `/recruiter/jobs/${job._id}/applicants`
  });
  await notification.save();

  // Emit Socket Notification to Recruiter
  if (socketHandler && socketHandler.emitToUser) {
    socketHandler.emitToUser(recruiterId, 'notification', notification);
    socketHandler.emitToUser(recruiterId, 'new_applicant', {
      candidateName: candidate.name,
      jobTitle: job.title,
      applicationId: application._id
    });
  }

  // Send email to Candidate confirming receipt
  const emailHtml = applicationReceivedTemplate(candidate.name, job.title);
  await sendEmail({
    to: candidate.email,
    subject: `Application Received: ${job.title} at HireFlow`,
    html: emailHtml
  });

  return successResponse(res, 201, 'Successfully applied for the job', application);
});

// DELETE /api/applications/:id
const withdraw = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) {
    return errorResponse(res, 404, 'Application not found');
  }

  if (app.candidateId.toString() !== req.user.id) {
    return errorResponse(res, 403, 'Unauthorized to withdraw this application');
  }

  const job = await Job.findById(app.jobId);
  if (job) {
    job.applicantCount = Math.max(0, job.applicantCount - 1);
    await job.save();
  }

  await Application.findByIdAndDelete(req.params.id);

  return successResponse(res, 200, 'Application withdrawn successfully');
});

module.exports = {
  apply,
  withdraw
};
