const express = require('express');
const router = express.Router({ mergeParams: true });
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.route('/')
  .get(getExpenses)
  .post(createExpense);

router.route('/:expenseId')
  .patch(updateExpense)
  .delete(deleteExpense);

module.exports = router;
