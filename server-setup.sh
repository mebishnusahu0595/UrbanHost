#!/bin/bash

# Complete server setup script for UrbanHost
# Run from ~/urban-host/urbanhost/ directory

echo "🚀 Starting complete UrbanHost setup..."

# Update system
echo "📦 Updating system..."
sudo apt update

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

echo "✅ Node version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# Install MongoDB
echo "📥 Installing MongoDB..."
if ! command -v mongod &> /dev/null; then
    # Import MongoDB public key
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Install MongoDB
    sudo apt update
    sudo apt install -y mongodb-org
    
    # Start MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    echo "✅ MongoDB installed and started"
else
    echo "✅ MongoDB already installed"
    sudo systemctl start mongod 2>/dev/null || true
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    sudo npm install -g pm2
fi

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📥 Installing Nginx..."
    sudo apt install -y nginx
fi

# Pull latest code
echo "🔄 Pulling latest code from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing npm packages..."
npm install

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOL'
MONGODB_URI=mongodb://localhost:27017/urbanhost
NEXTAUTH_URL=http://72.62.243.77
NEXTAUTH_SECRET=UrbanHost-Super-Secret-Key-2026-Production
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOL

# Build application
echo "🔨 Building Next.js application..."
npm run build

# Seed admin user
echo "🌱 Creating admin user..."
npm run seed

# Configure Nginx
echo "⚙️  Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/urbanhost
sudo ln -sf /etc/nginx/sites-available/urbanhost /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    echo "✅ Nginx configured and restarted"
else
    echo "❌ Nginx configuration error"
fi

# Stop any existing PM2 processes
echo "🛑 Stopping old PM2 processes..."
pm2 delete all 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting application..."
pm2 start npm --name urbanhost -- start
pm2 save
pm2 startup | tail -n 1 | sudo bash

# Wait for app to start
sleep 5

# Check status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Website: http://72.62.243.77"
echo "📱 Admin Dashboard: http://72.62.243.77/admin/dashboard"
echo ""
echo "🔐 Admin Login:"
echo "   Email: admin@urbanhost.com"
echo "   Password: UrbanHosts123!"
echo ""
echo "📊 Check status:"
echo "   pm2 list"
echo "   pm2 logs urbanhost"
echo "   sudo systemctl status nginx"
echo "   sudo systemctl status mongod"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
