#!/bin/bash

echo "🚀 Starting Bus Niyojak Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating default .env file..."
    echo "MONGODB_URI=mongodb+srv://busniyojak:busniyojak:@busniyojak.zfxad14.mongodb.net/?retryWrites=true&w=majority&appName=BusNiyojak" > .env
    echo "PORT=5001" >> .env
    echo "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" >> .env
    echo "NODE_ENV=development" >> .env
    echo "✅ .env file created"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if GTFS data needs to be imported
echo "🔍 Checking if GTFS data needs to be imported..."
if [ ! -f "gtfs_imported.flag" ]; then
    echo "📊 Importing GTFS data to MongoDB..."
    node --max-old-space-size=4096 scripts/import-gtfs.js
    if [ $? -eq 0 ]; then
        echo "✅ GTFS data imported successfully"
        touch gtfs_imported.flag
    else
        echo "❌ GTFS data import failed"
        exit 1
    fi
else
    echo "✅ GTFS data already imported"
fi

# Start the server
echo "🌐 Starting server..."
npm start 