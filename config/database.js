const mongoose = require('mongoose');
const dns = require('dns').promises;



const connectWithRetry = async (retries = 5, delay = 5000) => {
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 2000,
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        // ssl: true,
        // authSource: 'admin'
    };

    for (let i = 0; i < retries; i++) {
        try {
            console.log('Attempting MongoDB connection...');
            const conn = await mongoose.connect(process.env.MONGODB_URI, options);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return conn;
        } catch (error) {
            console.error(`Connection attempt ${i + 1} failed:`, error);
            
            if (i === retries - 1) {
                console.error('All connection attempts failed');
                throw error;
            }

            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const setupConnectionHandlers = () => {
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        connectWithRetry().catch(err => {
            console.error('Reconnection failed:', err);
        });
    });

    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
    });
};

module.exports = {
    connectWithRetry,
    setupConnectionHandlers
};