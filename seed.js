/**
 * Seed script — paste this entire file into the browser console
 * while the app is open at http://localhost:5173
 * Then refresh the page.
 */
(function () {
  const categories = [
    { id: 'cat-01', name: 'Rent',                       amount: 54400, type: 'Expense',    color: '#6366f1' },
    { id: 'cat-02', name: 'Mutual Fund',                amount: 75000, type: 'Investment', color: '#10b981' },
    { id: 'cat-03', name: 'PPF',                        amount: 10000, type: 'Investment', color: '#06b6d4' },
    { id: 'cat-04', name: 'Home Loan',                  amount: 82000, type: 'Expense',    color: '#f59e0b' },
    { id: 'cat-05', name: 'Fuel',                       amount:  4000, type: 'Expense',    color: '#3b82f6' },
    { id: 'cat-06', name: 'Travel Fund - RBL',          amount: 30000, type: 'Expense',    color: '#ec4899' },
    { id: 'cat-07', name: 'Gift - ICICI',               amount: 20000, type: 'Expense',    color: '#14b8a6' },
    { id: 'cat-08', name: 'Insurance - AU Bank',        amount:  6000, type: 'Expense',    color: '#f97316' },
    { id: 'cat-09', name: 'OTT, Internet, Subscriptions', amount: 3000, type: 'Expense',  color: '#8b5cf6' },
    { id: 'cat-10', name: 'Personal - HSBC',            amount: 30000, type: 'Expense',    color: '#84cc16' },
    { id: 'cat-11', name: 'Extra Tax - Liquid Fund',    amount:  5000, type: 'Expense',    color: '#e11d48' },
  ]

  const allIds = categories.map(c => c.id)

  // January: all done. February: all done except Rent (cat-01).
  const tracking = {
    '2026': {
      '1': Object.fromEntries(allIds.map(id => [id, true])),
      '2': Object.fromEntries(allIds.map(id => [id, id !== 'cat-01'])),
    }
  }

  const settings = {
    currencySymbol: '₹',
    currentYear: 2026,
  }

  localStorage.setItem('budget_categories', JSON.stringify(categories))
  localStorage.setItem('budget_tracking',   JSON.stringify(tracking))
  localStorage.setItem('budget_settings',   JSON.stringify(settings))

  console.log('✅ Seed data loaded. Refresh the page.')
})()
