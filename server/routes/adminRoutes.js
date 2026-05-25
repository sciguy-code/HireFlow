const express = require('express');
const {
  getStats,
  getUsers,
  getUserById,
  blockUser,
  approveRecruiter,
  getAdminJobs,
  moderateJob,
  deleteJobByAdmin,
  getAdminApplications
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/approve', approveRecruiter);
router.get('/jobs', getAdminJobs);
router.patch('/jobs/:id/status', moderateJob);
router.delete('/jobs/:id', deleteJobByAdmin);
router.get('/applications', getAdminApplications);

module.exports = router;
