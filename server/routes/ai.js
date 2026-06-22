const express = require('express');
const router = express.Router({ mergeParams: true });
const { getRecommendations, chatWithBot } = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getRecommendations);
router.post('/chat', verifyToken, chatWithBot);

module.exports = router;
