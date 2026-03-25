#!/bin/bash

# Urban Hosts - Server Deployment Script
# For use on root@72.62.243.77

echo "🚀 Starting Urban Hosts deployment..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20.x if not installed
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# Install MongoDB if not installed
if ! command -v mongod &> /dev/null; then
    echo "📥 Installing MongoDB..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt update
    apt install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    npm install -g pm2
fi

# Clone or pull repository
PROJECT_DIR="/var/www/urbanhost"
if [ -d "$PROJECT_DIR" ]; then
    echo "🔄 Updating existing project..."
    cd $PROJECT_DIR
    git pull origin main
else
    echo "📥 Cloning repository..."
    mkdir -p /var/www
    cd /var/www
    git clone https://github.com/Deepakscripts/UrbanHost.git urbanhost
    cd urbanhost
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if not exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
MONGODB_URI=mongodb://localhost:27017/urbanhost
NEXTAUTH_URL=https://urbanhost.in
NEXTAUTH_SECRET=$(openssl rand -base64 32)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EOL
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Seed admin user
echo "🌱 Seeding admin user..."
npm run seed

# Configure Nginx
echo "⚙️  Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/urbanhost
ln -sf /etc/nginx/sites-available/urbanhost /etc/nginx/sites-enabled/urbanhost
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 delete urbanhost 2>/dev/null || true
pm2 start npm --name "urbanhost" -- start
pm2 save
pm2 startup

# Wait for app to start
echo "⏳ Waiting for app to start..."
sleep 5

# Check if app is running
if pm2 list | grep -q "urbanhost.*online"; then
    echo "✅ App is running!"
else
    echo "❌ App failed to start. Check logs: pm2 logs urbanhost"
fi

echo "✅ Deployment complete!"
echo ""
echo "📊 Admin Credentials:"
echo "   Email: admin@urbanhost.com"
echo "   Password: UrbanHosts123!"
echo ""
echo "🌐 Application running at: http://72.62.243.77"
echo "📱 Admin Dashboard: http://72.62.243.77/admin/dashboard"
echo ""
echo "💡 Useful commands:"
echo "   pm2 logs urbanhost       - View logs"
echo "   pm2 restart urbanhost    - Restart app"
echo "   pm2 stop urbanhost       - Stop app"
echo "   systemctl status nginx   - Check nginx status"
echo "   systemctl restart nginx  - Restart nginx"
