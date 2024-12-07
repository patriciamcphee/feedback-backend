// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors({
    origin: 'https://smart-search-plugin-demo.vercel.app',
    methods: ['POST']
}));

// Enhanced logging middleware
app.use((req, res, next) => {
    console.log('\n--- New Request ---');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

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

// Feedback submission endpoint with detailed error handling
app.post('/api/feedback', async (req, res) => {
    try {
        // Log the incoming data
        console.log('\nProcessing feedback submission:');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        // Validate required fields before creating the model
        if (!req.body.page) {
            throw new Error('Page field is required');
        }
        if (!req.body.type || !['like', 'dislike'].includes(req.body.type)) {
            throw new Error('Valid type (like/dislike) is required');
        }

        // Create and validate the feedback instance
        const feedback = new Feedback(req.body);
        const validationError = feedback.validateSync();
        if (validationError) {
            throw new Error(`Validation error: ${validationError.message}`);
        }

        // Attempt to save
        console.log('Attempting to save feedback to MongoDB...');
        await feedback.save();
        console.log('Feedback saved successfully');
        
        res.status(201).json({ 
            message: 'Feedback submitted successfully',
            id: feedback._id 
        });
    } catch (error) {
        // Enhanced error logging
        console.error('\nError processing feedback:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Send appropriate error response
        res.status(500).json({ 
            message: 'Error submitting feedback',
            error: error.message,
            type: error.name
        });
    }
});

// MongoDB connection with detailed error handling
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('Database connection status:', mongoose.connection.readyState);
})
.catch(err => {
    console.error('MongoDB connection error:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
});