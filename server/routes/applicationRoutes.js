const express = require('express');
const { apply, withdraw } = require('../controllers/applicationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

const router = express.Router();

router.use(authenticate);
router.use(authorize('candidate'));

router.post('/', apply);
router.delete('/:id', withdraw);

module.exports = router;
