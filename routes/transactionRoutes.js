const express = require('express');
const {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getStats
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.route('/')
    .get(getTransactions)
    .post(addTransaction);

router.route('/stats')
    .get(getStats);

router.route('/:id')
    .put(updateTransaction)
    .delete(deleteTransaction);

module.exports = router;
