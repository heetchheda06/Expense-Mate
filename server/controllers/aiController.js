const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const Profile = require('../models/Profile');
const Income = require('../models/Income');
const Trip = require('../models/Trip');
const { calculateSettlements } = require('./tripController');

// Custom AI-powered financial tip generator
const getAIBudgetTips = () => {
  const tips = [
    'Look for loyalty programs and cashback rewards! Retailers, food outlets, and subscription services often offer 10% to 30% savings.',
    'Use the 50/30/20 rule: allocate 50% of your income to needs (rent, groceries), 30% to wants, and 20% directly to savings goals.',
    'Pack your lunch! Eating out during work or travel can easily drain ₹1000+ per week. Meal prep to save big.',
    'Consider buying refurbished tech or quality second-hand goods on platforms like eBay or local forums instead of paying full retail prices.',
    'Track subscription services and cancel any you haven\'t used in the past 30 days (gym memberships, extra streaming plans, premium software).',
    'Utilize free local libraries, public parks, and community events for free entertainment and fitness resources.',
    'Set up automated weekly micro-transfers (e.g., ₹100) into your savings goals. Consistency builds strong financial habits.'
  ];
  // Shuffle and pick 3 random recommendations
  return tips.sort(() => 0.5 - Math.random()).slice(0, 3);
};

// @desc    Generate financial recommendations using Heuristic rules or OpenAI API
// @route   GET /api/profiles/:id/ai-recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // 1. Gather Profile Analytics data
    const expenses = await Expense.find({ profileId: req.params.id });
    const goals = await Goal.find({ profileId: req.params.id });

    // Compute monthly statistics
    const now = new Date();
    const currentMonthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getFullYear() === now.getFullYear() && expDate.getMonth() === now.getMonth();
    });

    const totalSpentThisMonth = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budget = profile.monthlyBudget || 0;
    const ratio = budget > 0 ? (totalSpentThisMonth / budget) : 0;

    // Define Budget Alert status
    let budgetAlert = 'unconfigured';
    let budgetText = 'You have not configured a monthly budget for this profile yet. Go to settings to set one!';
    if (budget > 0) {
      if (ratio < 0.7) {
        budgetAlert = 'safe';
        budgetText = `Awesome! You have spent ${Math.round(ratio * 100)}% of your monthly budget. You are well on track!`;
      } else if (ratio >= 0.7 && ratio <= 1.0) {
        budgetAlert = 'warning';
        budgetText = `Heads up! You have utilized ${Math.round(ratio * 100)}% of your monthly budget. Think about cutting non-essential spending.`;
      } else {
        budgetAlert = 'danger';
        budgetText = `Alert! You have exceeded your budget by ₹${(totalSpentThisMonth - budget).toFixed(2)} (${Math.round(ratio * 100)}% spent). Review your expenditures immediately.`;
      }
    }

    // Compute Category Spending distribution
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    let topCategory = 'None';
    let topCategoryAmount = 0;
    Object.keys(categoryTotals).forEach(cat => {
      if (categoryTotals[cat] > topCategoryAmount) {
        topCategoryAmount = categoryTotals[cat];
        topCategory = cat;
      }
    });

    let categoryAdvice = '';
    if (topCategoryAmount > 0) {
      const percentageOfTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0) > 0 
        ? Math.round((topCategoryAmount / expenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100)
        : 0;
      
      categoryAdvice = `Your top spending category is "${topCategory}" representing ${percentageOfTotal}% (₹${topCategoryAmount.toFixed(2)}) of your total spending.`;
      
      if (topCategory === 'Food') {
        categoryAdvice += ' Food and dining out can quickly accumulate. Try cooking at home or prepping meals to save on dining expenses!';
      } else if (topCategory === 'Transport') {
        categoryAdvice += ' Consider carpooling, public transit, or biking to reduce your monthly transport costs.';
      } else if (topCategory === 'Education') {
        categoryAdvice += ' Look for scholarships, free courses, or digital textbooks to lower educational expenses.';
      } else if (topCategory === 'Shopping') {
        categoryAdvice += ' Apply a 48-hour rule: wait two days before completing any online shopping purchases to avoid impulse buying.';
      } else if (topCategory === 'Health') {
        categoryAdvice += ' Make sure to compare pharmacy prices or ask if generic drug substitutes are available to save on healthcare.';
      } else if (topCategory === 'Bills') {
        categoryAdvice += ' Review utility bills and subscription plans to cut down on recurring monthly overheads.';
      } else if (topCategory === 'EMI') {
        categoryAdvice += ' Ensure EMI payments are paid on time to avoid penalties and improve your credit score.';
      } else if (topCategory === 'Investments') {
        categoryAdvice += ' Great job investing! Try setting up automatic monthly SIPs to build wealth consistently.';
      } else if (topCategory === 'Entertainment') {
        categoryAdvice += ' Look for group discount deals or organize game/movie nights with friends instead of expensive nights out.';
      } else if (topCategory === 'Grocery') {
        categoryAdvice += ' Buying in bulk or planning meals around store sales can help reduce your weekly grocery bill.';
      } else {
        categoryAdvice += ' Review individual line items in this category to see if there are subscription costs or unnecessary expenses you can reduce.';
      }
    } else {
      categoryAdvice = 'No transactions recorded yet. Start adding expenses to receive category-specific insights!';
    }

    // Compute Savings Goals Status
    const savingsAdvice = goals.map(goal => {
      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
      const remainingTimeMs = new Date(goal.deadline) - now;
      const remainingWeeks = Math.max(1, Math.ceil(remainingTimeMs / (7 * 24 * 60 * 60 * 1000)));

      if (remainingAmount === 0) {
        return {
          goalId: goal._id,
          name: goal.name,
          status: 'completed',
          message: `Congratulations! You fully completed your savings goal for "${goal.name}"!`
        };
      }

      const weeklyTarget = (remainingAmount / remainingWeeks).toFixed(2);
      
      if (remainingTimeMs < 0) {
        return {
          goalId: goal._id,
          name: goal.name,
          status: 'overdue',
          message: `The deadline for "${goal.name}" has passed. You still need ₹${remainingAmount.toFixed(2)} to complete it.`
        };
      }

      return {
        goalId: goal._id,
        name: goal.name,
        status: 'on_track',
        message: `To reach your goal of ₹${goal.targetAmount} for "${goal.name}" by the deadline (${new Date(goal.deadline).toLocaleDateString()}), you need to save ₹${weeklyTarget} per week.`
      };
    });

    // Check if OpenAI API Key exists to elevate recommendations
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        const payload = {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are ExpenseMate AI, a friendly, extremely knowledgeable personal financial advisor. You give actionable, encouraging, and highly specific budgeting advice to users based on their spending.'
            },
            {
              role: 'user',
              content: `Please analyze my monthly spending report and generate exactly 4 custom personalized budgeting tips.
              
              PROFILE DETAILS:
              - Name: ${profile.name}
              - Monthly Budget: ₹${budget}
              - Actual Spent this month: ₹${totalSpentThisMonth.toFixed(2)}
              - Top spending category: ${topCategory} (₹${topCategoryAmount.toFixed(2)})
              
              SAVINGS GOALS:
              ${goals.map(g => `- ${g.name}: ₹${g.currentAmount} saved out of ₹${g.targetAmount} target (Deadline: ${new Date(g.deadline).toLocaleDateString()})`).join('\n')}
              
              Format your response as a valid JSON object matching this structure:
              {
                "budgetSummary": "A concise paragraph summarizing their budget status.",
                "categoryTip": "A deep tip about their top category.",
                "savingsOptimization": "Specific suggestion to reach their goals on time.",
                "personalizedTips": [
                  "Tip 1: ...",
                  "Tip 2: ...",
                  "Tip 3: ..."
                ]
              }`
            }
          ],
          temperature: 0.7
        };

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          const parsedContent = JSON.parse(result.choices[0].message.content.trim());
          
          return res.status(200).json({
            success: true,
            source: 'OpenAI GPT-3.5',
            budget: {
              spent: totalSpentThisMonth,
              limit: budget,
              ratio,
              alert: budgetAlert,
              summary: parsedContent.budgetSummary || budgetText
            },
            categoryAnalysis: {
              topCategory,
              amount: topCategoryAmount,
              advice: parsedContent.categoryTip || categoryAdvice
            },
            savingsAnalysis: savingsAdvice,
            recommendations: parsedContent.personalizedTips || getAIBudgetTips()
          });
        } else {
          console.warn('OpenAI API returned non-OK status. Falling back to local heuristic engine.');
        }
      } catch (err) {
        console.error('OpenAI fetch error: ', err.message);
      }
    }

    // Heuristics Fallback response
    return res.status(200).json({
      success: true,
      source: 'Heuristic Rules Engine',
      budget: {
        spent: totalSpentThisMonth,
        limit: budget,
        ratio,
        alert: budgetAlert,
        summary: budgetText
      },
      categoryAnalysis: {
        topCategory,
        amount: topCategoryAmount,
        advice: categoryAdvice
      },
      savingsAnalysis: savingsAdvice,
      recommendations: getAIBudgetTips()
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Chat with ExpenseMate AI Bot (context-aware)
// @route   POST /api/profiles/:id/ai-chat
// @access  Private
exports.chatWithBot = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (profile.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(200).json({
        success: true,
        reply: "Hi there! I am ExpenseMate AI. It looks like the Gemini API Key is not configured yet. Please configure the `GEMINI_API_KEY` in the server's `.env` file to start chatting!"
      });
    }

    // 1. Gather Profile Analytics data
    const expenses = await Expense.find({ profileId: req.params.id });
    const incomes = await Income.find({ profileId: req.params.id });
    const goals = await Goal.find({ profileId: req.params.id });

    // 2. Gather Trip Splitter data
    const trips = await Trip.find({ owner: req.user.id });
    let tripsSummary = '';
    if (trips && trips.length > 0) {
      tripsSummary = trips.map(t => {
        const summary = calculateSettlements(t.members, t.contributions, t.expenses);
        const membersList = t.members.map(m => `- ${m.name} (size: ${m.memberCount || 1}, contact: ${m.contact || 'N/A'})`).join('\n');
        const recentExpenses = t.expenses.slice(-5).map(e => `- ${e.title}: ₹${e.amount} paid by ${e.paidBy} on ${new Date(e.date).toLocaleDateString()} (${e.category})`).join('\n');
        const settlementsList = summary.settlements.map(s => `- ${s.from} pays ₹${s.amount.toFixed(2)} to ${s.to}`).join('\n');
        const balancesList = Object.entries(summary.balances).map(([name, bal]) => `- ${name}: ${bal >= 0 ? '+' : ''}₹${bal.toFixed(2)}`).join('\n');

        return `### Trip: ${t.name} (Destination: ${t.destination})
Dates: ${new Date(t.startDate).toLocaleDateString()} to ${new Date(t.endDate).toLocaleDateString()}
Total Expenses: ₹${summary.totalExpenses.toFixed(2)}
Per Person Base Share: ₹${summary.perPersonShare.toFixed(2)}
Total People Count: ${summary.totalPeopleCount}
Remaining Kitty Cash: ₹${summary.remainingCommonCash.toFixed(2)}

Members:
${membersList || 'None'}

Recent Expenses:
${recentExpenses || 'None'}

Balances:
${balancesList || 'None'}

Settlement Plan:
${settlementsList || 'All settled up!'}`;
      }).join('\n\n');
    } else {
      tripsSummary = 'No active trips configured in Trip Splitter.';
    }

    // Compute stats
    const now = new Date();
    const currentMonthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getFullYear() === now.getFullYear() && expDate.getMonth() === now.getMonth();
    });
    const totalSpentThisMonth = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budget = profile.monthlyBudget || 0;

    // Category distribution
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const goalsSummary = goals.map(g => {
      return `- ${g.name}: Target ₹${g.targetAmount}, Saved ₹${g.currentAmount}, Deadline: ${new Date(g.deadline).toLocaleDateString()}`;
    }).join('\n');

    const incomesSummary = incomes.slice(0, 10).map(inc => {
      return `- ${inc.source}: ₹${inc.amount} on ${new Date(inc.date).toLocaleDateString()}`;
    }).join('\n');

    const expensesSummary = currentMonthExpenses.slice(0, 10).map(exp => {
      return `- ${exp.description || exp.category}: ₹${exp.amount} on ${new Date(exp.date).toLocaleDateString()} (${exp.category})`;
    }).join('\n');

    // Build the context system instruction
    const systemPrompt = `You are ExpenseMate AI, a helpful, context-aware personal financial assistant. You are chatting with a user named ${profile.name}.
Here is their financial overview:
- Monthly Budget: ₹${budget}
- Total Spent this month: ₹${totalSpentThisMonth.toFixed(2)}
- Spending by category: ${JSON.stringify(categoryTotals)}
- Active Savings Goals:
${goalsSummary || 'No active goals.'}
- Recent Income entries:
${incomesSummary || 'No income entries.'}
- Recent Expense entries (this month):
${expensesSummary || 'No recent expenses.'}

- Trip Splitter details (for group splitting, kitty contributions, direct payments, and settlements):
${tripsSummary}

Use this context to answer their questions. Keep your answers concise, encouraging, and focused on practical personal saving strategies. Always use Rupee symbol (₹) for currency. Refer to them by name (${profile.name}) occasionally to make it personal.`;

    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach(h => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
    let response;
    let success = false;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents
          })
        });

        if (response.ok) {
          success = true;
          break;
        } else {
          const errBody = await response.text();
          console.warn(`Gemini API model ${model} failed with status ${response.status}:`, errBody);
          lastError = new Error(`Gemini API returned status ${response.status}`);
        }
      } catch (err) {
        console.error(`Fetch error for model ${model}:`, err.message);
        lastError = err;
      }
    }

    if (!success) {
      throw lastError || new Error('All Gemini models failed to generate response');
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ success: true, reply });
    } else {
      throw new Error('Invalid response structure from Gemini API');
    }

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to generate response from AI bot.' });
  }
};

