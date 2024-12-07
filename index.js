// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors({
    // Allow requests only from your Docusaurus domain
    origin: 'https://smart-search-plugin-demo.vercel.app/',
    methods: ['POST']
}));

// Define the feedback schema
const feedbackSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'dislike'],
        required: true
    },
    options: [{
        type: String
    }],
    comment: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Feedback submission endpoint
app.post('/api/feedback/submit', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Error submitting feedback' });
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});