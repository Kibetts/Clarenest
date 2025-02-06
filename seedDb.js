const mongoose = require('mongoose');
const Admin = require('./models/admin.model');
require('dotenv').config();

const adminUsers = [
    {
        name: 'Brian Kibet',
        email: 'kibetsbrian@gmail.com',
        password: 'Tingatales1!',
        role: 'admin',
        department: 'Academic Affairs',
        adminLevel: 'Head',
        permissions: ['manage_users', 'manage_courses', 'manage_finances', 'system_settings'],
        status: 'active',
        isEmailVerified: true
    },
    {
        name: 'Francisca Chepkirui',
        email: 'franciscachepkirui@gmail.com',
        password: 'Finance@123',
        role: 'admin',
        department: 'Finance',
        adminLevel: 'Senior',
        permissions: ['manage_users', 'manage_courses', 'manage_finances', 'system_settings'],
        status: 'active',
        isEmailVerified: true
    },
    {
        name: 'Francisca Chepkirui',
        email: 'admin@clarenest.co.ke',
        password: 'Finance@123',
        role: 'admin',
        department: 'Finance',
        adminLevel: 'Senior',
        permissions: ['manage_users', 'manage_courses', 'manage_finances', 'system_settings'],
        status: 'active',
        isEmailVerified: true
    }
    
];

const seedDatabase = async () => {
    try {
        // Construct the connection URI
        let uri = process.env.MONGODB_URI;
        
        // Ensure the URI is properly formatted for 'Clarenest' database
        if (uri.includes('mongodb+srv://')) {
            // For MongoDB Atlas URI
            uri = uri.replace(/\/[^/?]+(\?|$)/, '/Clarenest$1');
        } else {
            // For standard MongoDB URI
            uri = uri.replace(/\/[^/?]+(\?|$)/, '/Clarenest$1');
        }

        console.log('Connecting to database...');
        
        // Connect to MongoDB
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Log the current database name
        console.log('Connected to database:', mongoose.connection.db.databaseName);

        // Clear existing admin users
        console.log('Clearing existing admin users...');
        await Admin.deleteMany({});

        // Create new admin users
        console.log('Creating new admin users...');
        const createdAdmins = await Admin.create(adminUsers);
        
        // Log created admins
        console.log('Created admin users:');
        createdAdmins.forEach(admin => {
            console.log(`- ${admin.name} (${admin.email})`);
        });

        // Verify creation
        const adminCount = await Admin.countDocuments();
        console.log(`Total admins in database: ${adminCount}`);

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error details:', error);
        if (mongoose.connection) {
            await mongoose.connection.close();
        }
    }
    process.exit(0);
};

seedDatabase();