#!/bin/bash

# UrbanHost Setup Script

echo "🏨 UrbanHost Setup"
echo "=================="
echo ""

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed"
    echo ""
    echo "To install MongoDB on Ubuntu/Debian:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y mongodb"
    echo ""
    echo "For other systems, visit: https://www.mongodb.com/docs/manual/installation/"
    echo ""
    read -p "Do you want to continue without MongoDB? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB is installed"
    
    # Check if MongoDB is running
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is already running"
    else
        echo "⚠️  MongoDB is not running"
        echo "Starting MongoDB..."
        
        # Try to start MongoDB
        if command -v systemctl &> /dev/null; then
            sudo systemctl start mongodb || sudo systemctl start mongod
            echo "✅ MongoDB started via systemctl"
        else
            mongod --fork --logpath /var/log/mongodb/mongod.log --dbpath /var/lib/mongodb
            echo "✅ MongoDB started"
        fi
    fi
fi

echo ""
echo "📦 Installing npm packages..."
npm install

echo ""
echo "🔐 Checking environment variables..."

if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found"
    echo "Creating .env.local file..."
    
    cat > .env.local << EOF
# MongoDB
MONGODB_URI=mongodb://localhost:27017/urbanhost

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EOF
    
    echo "✅ .env.local created with secure random NEXTAUTH_SECRET"
else
    echo "✅ .env.local exists"
fi

echo ""
echo "📁 Creating upload directories..."
mkdir -p public/uploads/properties
mkdir -p public/uploads/documents
echo "✅ Upload directories created"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 Then visit: http://localhost:3000"
echo ""
echo "📖 For detailed setup instructions, see SETUP.md"
echo ""
