const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { upload } = require('../config/upload');
const generateController = require('../controllers/generateController');

router.post('/text', auth, generateController.fromText);
router.post('/file', auth, upload.single('file'), generateController.fromFile);
router.post('/review-essay', auth, generateController.reviewEssay);

module.exports = router;
