const Transaction = require('../models/Transaction');

// @desc    Get all transactions for a user (with filtering, search, and pagination)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const { search, category, startDate, endDate, page = 1, limit = 10 } = req.query;

        const query = { user: req.user.id };

        // Search text
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Filter by category
        if (category && category !== 'All') {
            query.category = category;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a single transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    try {
        const { title, amount, category, date, notes } = req.body;

        const transaction = await Transaction.create({
            user: req.user.id,
            title,
            amount,
            category,
            date: date || Date.now(),
            notes
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if user owns transaction
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await transaction.deleteOne();

        res.json({ message: 'Transaction removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/transactions/stats
// @access  Private
const getStats = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });

        const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        const categoryBreakdown = transactions.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});

        const recentTransactions = await Transaction.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(5);

        res.json({
            totalExpenses,
            categoryBreakdown,
            recentTransactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getStats
};
