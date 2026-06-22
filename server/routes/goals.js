const express = require('express');
const router = express.Router({ mergeParams: true });
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:goalId')
  .patch(updateGoal)
  .delete(deleteGoal);

module.exports = router;
