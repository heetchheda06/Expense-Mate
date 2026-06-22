const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTrip,
  createTrip,
  deleteTrip,
  addMember,
  deleteMember,
  updateMember,
  addContribution,
  deleteContribution,
  addExpense,
  deleteExpense,
  updateExpense,
  getTripSummary,
  getTripAiInsights
} = require('../controllers/tripController');
const { verifyToken } = require('../middleware/auth');

// Protect all routes
router.use(verifyToken);

router.get('/', getTrips);
router.post('/create', createTrip);
router.get('/:id', getTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/member', addMember);
router.patch('/:id/member/:memberId', updateMember);
router.delete('/:id/member/:memberId', deleteMember);
router.post('/:id/contribution', addContribution);
router.delete('/:id/contribution/:contribId', deleteContribution);
router.post('/:id/expense', addExpense);
router.patch('/:id/expense/:expenseId', updateExpense);
router.delete('/:id/expense/:expenseId', deleteExpense);
router.get('/:id/summary', getTripSummary);
router.get('/:id/ai-insights', getTripAiInsights);

module.exports = router;
