const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const cloudinary = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const calculateCompletion = (profile) => {
  let score = 0;
  if ((profile.headline && profile.headline.trim()) || (profile.bio && profile.bio.trim())) {
    score += 20;
  }
  if (profile.skills && profile.skills.length > 0) {
    score += 20;
  }
  if (profile.experience && profile.experience.length > 0) {
    score += 20;
  }
  if (profile.education && profile.education.length > 0) {
    score += 20;
  }
  if (profile.resumeUrl && profile.resumeUrl.trim()) {
    score += 20;
  }
  return score;
};

// GET /api/candidate/profile
const getProfile = asyncHandler(async (req, res) => {
  let profile = await CandidateProfile.findOne({ userId: req.user.id });
  if (!profile) {
    profile = new CandidateProfile({ userId: req.user.id });
    await profile.save();
  }
  profile.profileComplete = calculateCompletion(profile);
  await profile.save();

  return successResponse(res, 200, 'Candidate profile retrieved', profile);
});

// PUT /api/candidate/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { headline, bio, skills, location, experience, education, portfolioLinks } = req.body;

  let profile = await CandidateProfile.findOne({ userId: req.user.id });
  if (!profile) {
    profile = new CandidateProfile({ userId: req.user.id });
  }

  profile.headline = headline !== undefined ? headline : profile.headline;
  profile.bio = bio !== undefined ? bio : profile.bio;
  profile.skills = skills !== undefined ? skills : profile.skills;
  profile.location = location !== undefined ? location : profile.location;
  profile.experience = experience !== undefined ? experience : profile.experience;
  profile.education = education !== undefined ? education : profile.education;
  profile.portfolioLinks = portfolioLinks !== undefined ? portfolioLinks : profile.portfolioLinks;

  profile.profileComplete = calculateCompletion(profile);
  await profile.save();

  return successResponse(res, 200, 'Candidate profile updated', profile);
});

// POST /api/candidate/resume
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 400, 'Please upload a file');
  }

  let profile = await CandidateProfile.findOne({ userId: req.user.id });
  if (!profile) {
    profile = new CandidateProfile({ userId: req.user.id });
  }

  // Delete existing resume if any
  if (profile.resumePublicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'mock') {
    try {
      await cloudinary.uploader.destroy(profile.resumePublicId, { resource_type: 'raw' });
    } catch (err) {
      console.warn('Failed to delete old resume from Cloudinary:', err.message);
    }
  }

  let resumeUrl = '';
  let resumePublicId = '';

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'mock') {
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'resumes', resource_type: 'raw' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });
    };
    const result = await uploadStream();
    resumeUrl = result.secure_url;
    resumePublicId = result.public_id;
  } else {
    // Local mock for development ease
    resumeUrl = `https://res.cloudinary.com/mock/image/upload/resumes/resume_${req.user.id}_${Date.now()}.pdf`;
    resumePublicId = `resume_${req.user.id}_${Date.now()}`;
  }

  profile.resumeUrl = resumeUrl;
  profile.resumePublicId = resumePublicId;
  profile.profileComplete = calculateCompletion(profile);
  await profile.save();

  return successResponse(res, 200, 'Resume uploaded successfully', {
    resumeUrl,
    resumePublicId,
    profileComplete: profile.profileComplete
  });
});

// DELETE /api/candidate/resume
const deleteResume = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ userId: req.user.id });
  if (!profile || !profile.resumeUrl) {
    return errorResponse(res, 400, 'No resume to delete');
  }

  if (profile.resumePublicId && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'mock') {
    try {
      await cloudinary.uploader.destroy(profile.resumePublicId, { resource_type: 'raw' });
    } catch (err) {
      console.warn('Failed to delete resume from Cloudinary:', err.message);
    }
  }

  profile.resumeUrl = '';
  profile.resumePublicId = '';
  profile.profileComplete = calculateCompletion(profile);
  await profile.save();

  return successResponse(res, 200, 'Resume deleted successfully', {
    profileComplete: profile.profileComplete
  });
});

// GET /api/candidate/applications
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidateId: req.user.id })
    .populate({
      path: 'jobId',
      populate: { path: 'companyId', select: 'companyName logo location size industry website about' }
    })
    .sort({ appliedAt: -1 });

  return successResponse(res, 200, 'Applications retrieved', applications);
});

// GET /api/candidate/saved-jobs
const getSavedJobs = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ candidateId: req.user.id })
    .populate({
      path: 'jobId',
      populate: { path: 'companyId', select: 'companyName logo location industry size' }
    })
    .sort({ savedAt: -1 });

  return successResponse(res, 200, 'Saved jobs retrieved', saved);
});

// POST /api/candidate/saved-jobs/:jobId
const saveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const existing = await SavedJob.findOne({ candidateId: req.user.id, jobId });
  if (existing) {
    return errorResponse(res, 400, 'Job already saved');
  }

  const saved = new SavedJob({ candidateId: req.user.id, jobId });
  await saved.save();

  return successResponse(res, 201, 'Job saved successfully', saved);
});

// DELETE /api/candidate/saved-jobs/:jobId
const unsaveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const deleted = await SavedJob.findOneAndDelete({ candidateId: req.user.id, jobId });
  if (!deleted) {
    return errorResponse(res, 404, 'Saved job not found');
  }

  return successResponse(res, 200, 'Job unsaved successfully');
});

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  getMyApplications,
  getSavedJobs,
  saveJob,
  unsaveJob
};
