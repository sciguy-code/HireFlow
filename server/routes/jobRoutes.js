const express = require('express');
const { getJobs, getJobById } = require('../controllers/jobController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJobById);

module.exports = router;
