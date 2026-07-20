const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route files
const authRoutes = require('./routes/authRoutes');

// Mount routers
app.use('/api/auth', authRoutes);

// Temporary placeholder route for the root
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Roamly Platform API' });
});

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Roamly Backend Server running on port ${PORT}`);
});
