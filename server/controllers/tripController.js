const Trip = require('../models/Trip');

// Helper to calculate settlements
const calculateSettlements = (members, contributions, expenses) => {
  const memberNames = members.map(m => m.name);
  const totalPeopleCount = members.reduce((sum, m) => sum + (m.memberCount || 1), 0);

  if (totalPeopleCount === 0) {
    return {
      totalContributions: 0,
      totalExpenses: 0,
      perPersonShare: 0,
      totalPeopleCount: 0,
      remainingCommonCash: 0,
      balances: {},
      settlements: []
    };
  }

  // Initialize total paid and contributed
  const totalPaid = {};
  const totalContributed = {};
  const memberMap = {}; // mapping member name -> member object
  
  members.forEach(m => {
    totalPaid[m.name] = 0;
    totalContributed[m.name] = 0;
    memberMap[m.name] = m;
  });

  // Calculate direct expenses paid by each member
  let directExpensesSum = 0;
  let commonCashExpensesSum = 0;

  expenses.forEach(exp => {
    if (exp.paidBy === 'Common Cash') {
      commonCashExpensesSum += exp.amount;
    } else {
      if (totalPaid[exp.paidBy] !== undefined) {
        totalPaid[exp.paidBy] += exp.amount;
      }
      directExpensesSum += exp.amount;
    }
  });

  // Calculate contributions by each member
  let totalContributionsSum = 0;
  contributions.forEach(c => {
    if (totalContributed[c.memberName] !== undefined) {
      totalContributed[c.memberName] += c.amount;
    }
    totalContributionsSum += c.amount;
  });

  // Total expenses of the trip
  const totalTripExpenses = directExpensesSum + commonCashExpensesSum;
  // Per individual share (base share for 1 person)
  const perPersonShare = totalTripExpenses / totalPeopleCount;

  // Remaining Common Cash = Total Contributions - Common Cash Expenses
  const remainingCommonCash = totalContributionsSum - commonCashExpensesSum;

  // Net Balance for each person
  const balances = {};
  memberNames.forEach(name => {
    const m = memberMap[name];
    const mCount = m ? (m.memberCount || 1) : 1;
    
    // My group's total share of expenses
    const myGroupExpensesShare = perPersonShare * mCount;
    
    // My group's total share of remaining common cash refund
    const myGroupRefundShare = remainingCommonCash > 0 ? (remainingCommonCash / totalPeopleCount) * mCount : 0;
    
    // Net Balance = (My Contribution + My Direct Expense) - (My Group's Expenses Share) - (My Group's Refund Share)
    balances[name] = (totalContributed[name] + totalPaid[name]) - myGroupExpensesShare - myGroupRefundShare;
  });

  // Generate settlement transactions
  const debtorList = [];
  const creditorList = [];
  memberNames.forEach(name => {
    const bal = balances[name];
    if (bal < -0.01) {
      debtorList.push({ name, amount: Math.abs(bal) });
    } else if (bal > 0.01) {
      creditorList.push({ name, amount: bal });
    }
  });

  // Sort
  debtorList.sort((a, b) => b.amount - a.amount);
  creditorList.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtorList.length && cIdx < creditorList.length) {
    const debtor = debtorList[dIdx];
    const creditor = creditorList[cIdx];

    const settleAmount = Math.min(debtor.amount, creditor.amount);
    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: Math.round(settleAmount * 100) / 100
    });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount < 0.01) dIdx++;
    if (creditor.amount < 0.01) cIdx++;
  }

  // Round balances for return
  const roundedBalances = {};
  memberNames.forEach(name => {
    roundedBalances[name] = Math.round(balances[name] * 100) / 100;
  });

  return {
    totalContributions: totalContributionsSum,
    totalExpenses: totalTripExpenses,
    perPersonShare: Math.round(perPersonShare * 100) / 100,
    totalPeopleCount,
    remainingCommonCash: Math.round(remainingCommonCash * 100) / 100,
    balances: roundedBalances,
    settlements
  };
};

exports.calculateSettlements = calculateSettlements;

// @desc    Get all trips owned by user
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ owner: req.user.id }).sort({ startDate: -1 });
    res.status(200).json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a specific trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    if (trip.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this trip' });
    }
    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new trip
// @route   POST /api/trips/create
// @access  Private
exports.createTrip = async (req, res) => {
  try {
    const { name, destination, startDate, endDate, description } = req.body;
    if (!name || !destination || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const trip = await Trip.create({
      name,
      destination,
      startDate,
      endDate,
      description: description || '',
      owner: req.user.id,
      members: [],
      contributions: [],
      expenses: []
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    if (trip.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await Trip.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to trip
// @route   POST /api/trips/:id/member
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const { name, contact, memberCount } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Member name is required' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    // Prevent duplicate member names
    const exists = trip.members.some(m => m.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'Member name already exists in this trip' });
    }

    trip.members.push({
      name,
      contact: contact || '',
      memberCount: memberCount ? parseInt(memberCount) : 1
    });
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete member from trip
// @route   DELETE /api/trips/:id/member/:memberId
// @access  Private
exports.deleteMember = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    const member = trip.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    // Filter out contributions and expenses paid by this member
    trip.contributions = trip.contributions.filter(c => c.memberName !== member.name);
    trip.expenses = trip.expenses.filter(e => e.paidBy !== member.name);

    trip.members.pull(req.params.memberId);
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update member in trip
// @route   PATCH /api/trips/:id/member/:memberId
// @access  Private
exports.updateMember = async (req, res) => {
  try {
    const { name, contact, memberCount } = req.body;
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    const member = trip.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const oldName = member.name;

    if (name && name.toLowerCase() !== oldName.toLowerCase()) {
      // Prevent duplicate member names
      const exists = trip.members.some(m => m.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, message: 'Member name already exists in this trip' });
      }

      // Update contributions and expenses matching oldName
      trip.contributions.forEach(c => {
        if (c.memberName === oldName) {
          c.memberName = name;
        }
      });
      trip.expenses.forEach(e => {
        if (e.paidBy === oldName) {
          e.paidBy = name;
        }
      });
    }

    if (name) member.name = name;
    if (contact !== undefined) member.contact = contact;
    if (memberCount !== undefined) member.memberCount = parseInt(memberCount) || 1;

    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add contribution
// @route   POST /api/trips/:id/contribution
// @access  Private
exports.addContribution = async (req, res) => {
  try {
    const { memberName, amount, date } = req.body;
    if (!memberName || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide contributor name and amount' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    trip.contributions.push({
      memberName,
      amount: parseFloat(amount),
      date: date || new Date()
    });
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete contribution
// @route   DELETE /api/trips/:id/contribution/:contribId
// @access  Private
exports.deleteContribution = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    trip.contributions.pull(req.params.contribId);
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add expense
// @route   POST /api/trips/:id/expense
// @access  Private
exports.addExpense = async (req, res) => {
  try {
    const { title, category, amount, paidBy, date, notes } = req.body;
    if (!title || !category || !amount || !paidBy) {
      return res.status(400).json({ success: false, message: 'Please provide title, category, amount, and paidBy' });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    trip.expenses.push({
      title,
      category,
      amount: parseFloat(amount),
      paidBy,
      date: date || new Date(),
      notes: notes || ''
    });
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/trips/:id/expense/:expenseId
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    trip.expenses.pull(req.params.expenseId);
    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update expense
// @route   PATCH /api/trips/:id/expense/:expenseId
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const { title, category, amount, paidBy, date, notes } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    const expense = trip.expenses.id(req.params.expenseId);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    if (title !== undefined) expense.title = title;
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = parseFloat(amount) || 0;
    if (paidBy !== undefined) expense.paidBy = paidBy;
    if (date !== undefined) expense.date = date;
    if (notes !== undefined) expense.notes = notes || '';

    await trip.save();

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trip summary, balance sheet, and settlements
// @route   GET /api/trips/:id/summary
// @access  Private
exports.getTripSummary = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    const summary = calculateSettlements(trip.members, trip.contributions, trip.expenses);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Gemini AI trip insights
// @route   GET /api/trips/:id/ai-insights
// @access  Private
exports.getTripAiInsights = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.owner.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(200).json({
        success: true,
        insights: "Gemini API key is not configured in the backend environment. Add a valid `GEMINI_API_KEY` to receive automated trip budgeting tips."
      });
    }

    const { totalExpenses, perPersonShare, totalPeopleCount } = calculateSettlements(
      trip.members,
      trip.contributions,
      trip.expenses
    );

    // Compute categories totals
    const catTotals = {};
    trip.expenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });

    const durationDays = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (24 * 60 * 60 * 1000)));

    const prompt = `You are a helpful, expert trip financial analyzer.
Analyze the following trip expenses and contributions data:
- Trip Name: ${trip.name}
- Destination: ${trip.destination}
- Duration: ${durationDays} days
- Total Expenses: ₹${totalExpenses.toFixed(2)}
- Per Person Share (Base Share per Person): ₹${perPersonShare.toFixed(2)}
- Category Breakdown: ${JSON.stringify(catTotals)}
- Total People: ${totalPeopleCount} (across ${trip.members.length} member units/groups)

Generate exactly 3 bullet points of trip expense insights, including:
1. The biggest spending category and its percentage of the total.
2. The average spending per day.
3. Useful, tailored cost-saving suggestions for future trips based on this data.

Return only the 3 bullet points, formatted clearly in plain markdown text. Do not include any HTML. Keep it encouraging and action-oriented for travelers.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const insights = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ success: true, insights });
    } else {
      throw new Error('Invalid response structure from Gemini API');
    }

  } catch (error) {
    console.error('Trip AI error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate AI insights: ' + error.message });
  }
};
