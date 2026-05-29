const express = require('express');
const router = express.Router();
const Expenses = require('../models/Expense');
const auth = require('../middleware/auth');

// 1. Create Expense Route
router.post('/', auth, async (req, res) => {
   try {
      const { title, amount, category, date } = req.body; // Fixed typo from 'data' to 'date'
      const newExpense = new Expenses({
         user: req.userId,
         title,
         amount,
         category,
         date: date || undefined
      });
      const expense = await newExpense.save();
      res.status(201).json(expense);
   } catch (err) {
      res.status(500).json({ message: 'Server Error while creating expenses' });
   }
});

// 2. Get Expenses Route
router.get('/', auth, async (req, res) => {
   try {
      // Fixed: Using MongoDB's native .sort() instead of broken JS .toSorted()
      const expenses = await Expenses.find({ user: req.userId }).sort({ date: -1 });
      res.json(expenses);
   } catch (err) {
      res.status(500).json({ message: 'Server error with fetching expenses' });
   }
});

// 3. Delete Expense Route
router.delete('/:id', auth, async (req, res) => {
   try {
      const expense = await Expenses.findById(req.params.id);

      if (!expense) {
         return res.status(404).json({ message: 'Expense not found' });
      }

      if (expense.user.toString() !== req.userId) {
         return res.status(401).json({ message: 'User not authorized' });
      }

      await expense.deleteOne();
      res.json({ message: 'Expense removed successfully' });
   } catch (error) {
      res.status(500).json({ message: 'Server error while deleting expense' });
   }
});

module.exports = router;