import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the same directory as the script
const envPath = path.resolve(__dirname, '.env');
console.log(`Checking for .env at: ${envPath}`);
const uriBefore = process.env.MONGODB_URI;
console.log(`- MONGODB_URI before dotenv: ${uriBefore ? uriBefore.substring(0, 20) + '...' : 'UNDEFINED'}`);

dotenv.config({ path: envPath, override: true });

const uri = process.env.MONGODB_URI;
console.log(`- MONGODB_URI after dotenv: ${uri ? uri.substring(0, 20) + '...' : 'UNDEFINED'}`);

console.log('--- MongoDB Connection Test ---');
console.log('Environment Variables Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI exists:', !!uri);

if (!uri) {
    console.error('❌ Error: MONGODB_URI is not defined in your environment or .env file.');
    process.exit(1);
}

const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
console.log(`Connecting to: ${maskedUri}`);

async function testConnection() {
    try {
        console.log('Attempting to connect...');

        // Set a short timeout for the test
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('✅ Connection Successful!');
        console.log('Database Name:', mongoose.connection.name);
        console.log('Ready State:', mongoose.connection.readyState);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed!');

        if (error.message.includes('ECONNREFUSED')) {
            console.error('\nPossible Cause: The connection was refused.');
            console.error('Is your internet working? Is the MongoDB URI correct?');
        } else if (error.name === 'MongooseServerSelectionError') {
            console.error('\nPossible Cause: IP Address not allowed.');
            console.error('ACTION REQUIRED: Go to MongoDB Atlas -> Network Access and ensure your IP is allowed (or add 0.0.0.0/0).');
        } else if (error.message.includes('Authentication failed')) {
            console.error('\nPossible Cause: Invalid username or password in the connection string.');
        }

        console.error('\nFull Error Message:', error.message);
        process.exit(1);
    }
}

testConnection();
