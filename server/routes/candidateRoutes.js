const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  getMyApplications,
  getSavedJobs,
  saveJob,
  unsaveJob
} = require('../controllers/candidateController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { uploadResume: uploadResumeMiddleware } = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);
router.use(authorize('candidate'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/resume', uploadResumeMiddleware, uploadResume);
router.delete('/resume', deleteResume);
router.get('/applications', getMyApplications);
router.get('/saved-jobs', getSavedJobs);
router.post('/saved-jobs/:jobId', saveJob);
router.delete('/saved-jobs/:jobId', unsaveJob);

module.exports = router;
