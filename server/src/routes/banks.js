const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const bankController = require('../controllers/bankController');

router.get('/', auth, bankController.list);
router.get('/:id', auth, bankController.detail);
router.post('/', auth, bankController.create);
router.delete('/:id', auth, bankController.remove);

module.exports = router;
