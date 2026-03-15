const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/stats', auth, userController.getStats);

module.exports = router;
