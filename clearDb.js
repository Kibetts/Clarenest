const mongoose = require('mongoose');
require('dotenv').config();

const clearCollections = async () => {
    try {
        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Get all collections in the database
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Found collections:', collections.map(c => c.name));

        // Clear each collection using the raw MongoDB driver
        for (const collection of collections) {
            await mongoose.connection.db.collection(collection.name).deleteMany({});
            console.log(`Cleared collection: ${collection.name}`);
            
            // Verify it's empty
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`${collection.name} now has ${count} documents`);
        }

        console.log('All collections have been cleared');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error clearing collections:', error);
    }
    process.exit(0);
};

clearCollections();