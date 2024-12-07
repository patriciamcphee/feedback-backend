// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Add raw body logging before JSON parsing
app.use((req, res, next) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });

    req.on('end', function() {
        console.log('Raw request body:', data);
        req.rawBody = data;
        next();
    });
});

// Middleware for parsing JSON and enabling CORS
app.use(express.json());
app.use(cors({
    origin: 'https://smart-search-plugin-demo.vercel.app',
    methods: ['POST']
}));

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON Parse Error:', err.message);
        console.error('Raw body received:', req.rawBody);
        return res.status(400).json({ 
            error: 'Invalid JSON',
            details: 'The request body must be valid JSON'
        });
    }
    next(err);
});

// Debug logging middleware
app.use((req, res, next) => {
    console.log('Request URL:', req.url);
    console.log('Request Method:', req.method);
    console.log('Request Headers:', req.headers);
    console.log('Parsed Request Body:', req.body);
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

// Update the endpoint to match your request
app.post('/api/feedback', async (req, res) => {
  try {
      console.log('Processing feedback submission with body:', req.body);
      const feedback = new Feedback(req.body);
      await feedback.save();
      console.log('Feedback saved successfully');
      res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
      console.error('Error processing feedback:', error);
      res.status(500).json({ 
          message: 'Error submitting feedback',
          error: error.message 
      });
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