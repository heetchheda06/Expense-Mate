// c:\Users\Heet\.gemini\antigravity-ide\brain\7a514165-a2ef-4a32-945e-b0fcd99c8e86\scratch\test_ocr_parser.js

const parseReceiptContent = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  let merchant = 'Unknown Merchant';
  let amount = '';
  let date = new Date().toISOString().split('T')[0];

  if (lines.length > 0) {
    merchant = lines[0].replace(/[*#]/g, '').trim();
    if (merchant.length > 30) {
      merchant = merchant.substring(0, 30) + '...';
    }
  }

  const decimalRegex = /(\d+\.\d{2})/g;
  
  let finalTotals = [];
  let standardTotals = [];
  let subtotals = [];
  let anyNumbers = [];

  lines.forEach((line) => {
    // Clean up line
    const cleanLine = line.replace(/,/g, '').replace(/[₹$£€]/g, '');
    const lower = cleanLine.toLowerCase();

    // Skip discount lines
    if (lower.includes('discount') || lower.includes('savings') || lower.includes('saved') || lower.includes('coupon') || lower.includes('promo') || lower.includes('less') || lower.includes(' cashback')) {
      return;
    }

    const matches = cleanLine.match(decimalRegex);
    if (matches) {
      matches.forEach((valStr) => {
        const val = parseFloat(valStr);
        if (isNaN(val)) return;

        if (
          lower.includes('net sales') || 
          lower.includes('net amount') || 
          lower.includes('net value') ||
          lower.includes('net payable') ||
          lower.includes('net total') ||
          lower.includes('total paid') ||
          lower.includes('grand total') || 
          lower.includes('total due') || 
          lower.includes('amount due') ||
          lower.includes('total payable') ||
          lower.includes('net sales value') ||
          lower.includes('net sales amt')
        ) {
          finalTotals.push(val);
        } else if (lower.includes('subtotal') || lower.includes('sub-total')) {
          subtotals.push(val);
        } else if (lower.includes('total') || lower.includes('amount') || lower.includes('due') || lower.includes('net') || lower.includes('payable')) {
          standardTotals.push(val);
        } else {
          anyNumbers.push(val);
        }
      });
    }
  });

  if (finalTotals.length > 0) {
    amount = Math.max(...finalTotals);
  } else if (standardTotals.length > 0) {
    amount = Math.max(...standardTotals);
  } else if (subtotals.length > 0) {
    amount = Math.max(...subtotals);
  } else if (anyNumbers.length > 0) {
    amount = Math.max(...anyNumbers);
  }

  if (amount > 0) {
    amount = parseFloat(amount.toFixed(2));
  } else {
    amount = '';
  }

  const dateRegex = /(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})|(\d{2}-\d{2}-\d{4})/;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    const matchedStr = dateMatch[0];
    if (matchedStr.includes('/')) {
      const parts = matchedStr.split('/');
      if (parts[2].length === 4) {
        date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
    } else {
      date = matchedStr;
    }
  }

  return { merchant, amount, date };
};

// Test Cases
const testReceipt1 = `
JIO STORE MUMBAI
Date: 2026-06-22
Subtotal: 1,200.00
Total Discount: 150.00
Net Sales Value: 1,050.00
CGST 9%: 94.50
SGST 9%: 94.50
`;

const testReceipt2 = `
SUPERMARKET MART
Item 1: 50.00
Item 2: 120.00
Sub-total: 170.00
Promo discount: 20.00
Net Amount: 150.00
`;

console.log("Test 1 Result:", parseReceiptContent(testReceipt1));
console.log("Test 2 Result:", parseReceiptContent(testReceipt2));
