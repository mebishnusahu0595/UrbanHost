#!/bin/bash

# Quick fix for 502 Bad Gateway

echo "🔧 Fixing 502 Bad Gateway error..."

# Check if app is running
echo "📊 Checking PM2 status..."
pm2 list

# Check if Next.js is running on port 3000
echo "📡 Checking port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Port 3000 is in use"
else
    echo "❌ Port 3000 is NOT in use - Starting app..."
    cd /var/www/urbanhost
    pm2 restart urbanhost
fi

# Configure Nginx if not already done
echo "⚙️  Ensuring Nginx is configured..."
if [ -f "/var/www/urbanhost/nginx.conf" ]; then
    cp /var/www/urbanhost/nginx.conf /etc/nginx/sites-available/urbanhost
    ln -sf /etc/nginx/sites-available/urbanhost /etc/nginx/sites-enabled/urbanhost
    rm -f /etc/nginx/sites-enabled/default
    echo "✅ Nginx config updated"
fi

# Test and restart Nginx
echo "🔄 Testing and restarting Nginx..."
nginx -t
systemctl restart nginx

# Wait and check
sleep 3
echo ""
echo "📊 Final Status:"
echo "PM2 Status:"
pm2 list | grep urbanhost
echo ""
echo "Nginx Status:"
systemctl status nginx --no-pager | head -5
echo ""
echo "Port 3000:"
lsof -Pi :3000 -sTCP:LISTEN
echo ""
echo "✅ Done! Try accessing: http://72.62.243.77"
