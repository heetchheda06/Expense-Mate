const express = require('express');
const router = express.Router({ mergeParams: true });
const { getIncomes, createIncome, deleteIncome } = require('../controllers/incomeController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.route('/')
  .get(getIncomes)
  .post(createIncome);

router.route('/:incomeId')
  .delete(deleteIncome);

module.exports = router;
