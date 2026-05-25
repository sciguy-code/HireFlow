const express = require('express');
const {
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
} = require('../controllers/recruiterController');
const { authenticate } = require('../middleware/auth');
const { authorize, requireApproved } = require('../middleware/roles');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);
router.use(authorize('recruiter'));

// Company management does not require approval
router.get('/company', getCompany);
router.put('/company', updateCompany);
router.post('/company/logo', uploadImage, uploadLogo);

// Jobs, Applicants, Analytics require approved status
router.get('/jobs', requireApproved, getMyJobs);
router.post('/jobs', requireApproved, createJob);
router.get('/jobs/:id', requireApproved, getJobDetail);
router.put('/jobs/:id', requireApproved, updateJob);
router.delete('/jobs/:id', requireApproved, deleteJob);
router.get('/jobs/:id/applicants', requireApproved, getApplicants);
router.get('/applicants/:applicationId', requireApproved, getApplicantDetail);
router.patch('/applicants/:applicationId/status', requireApproved, updateApplicationStatus);
router.get('/analytics', requireApproved, getAnalytics);

module.exports = router;
