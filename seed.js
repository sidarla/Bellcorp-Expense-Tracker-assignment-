require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Transaction.deleteMany({});
        await User.deleteMany({});

        // Create a test user
        const user = await User.create({
            username: 'tester',
            email: 'test@example.com',
            password: 'password123'
        });

        const categories = ['Food', 'Rent', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other'];
        const transactions = [];

        for (let i = 0; i < 50; i++) {
            transactions.push({
                user: user._id,
                title: `${categories[i % categories.length]} Expense ${i + 1}`,
                amount: Math.floor(Math.random() * 200) + 10,
                category: categories[i % categories.length],
                date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
                notes: `Automated seed entry ${i + 1}`
            });
        }

        await Transaction.insertMany(transactions);
        console.log('Database Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
