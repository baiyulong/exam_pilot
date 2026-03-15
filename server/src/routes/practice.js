const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const practiceController = require('../controllers/practiceController');

router.get('/choice', auth, practiceController.getChoiceQuestions);
router.get('/case', auth, practiceController.getCaseQuestions);
router.get('/essay', auth, practiceController.getEssayQuestions);
router.post('/submit', auth, practiceController.submit);
router.get('/wrong', auth, practiceController.getWrongAnswers);
router.get('/favorites', auth, practiceController.getFavorites);
router.post('/favorites', auth, practiceController.addFavorite);
router.delete('/favorites/:id', auth, practiceController.removeFavorite);
router.get('/categories', auth, practiceController.getCategories);

module.exports = router;
