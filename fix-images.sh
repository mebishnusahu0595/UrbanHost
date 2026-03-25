#!/bin/bash

echo "=== Fixing Image Loading Issue on VPS ==="
echo ""

# Update nginx configuration to serve uploads directly
echo "Step 1: Updating nginx configuration..."
cat > /etc/nginx/sites-available/urbanhost.in << 'EOF'
server {
    server_name urbanhost.in www.urbanhost.in;

    # Serve uploads directory directly (bypass Next.js for better performance)
    location /uploads/ {
        alias /root/urban-host/urbanhost/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy everything else to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/urbanhost.in/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/urbanhost.in/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.urbanhost.in) {
        return 301 https://$host$request_uri;
    }

    if ($host = urbanhost.in) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name urbanhost.in www.urbanhost.in;
    return 404; # managed by Certbot
}
EOF

echo "✓ Nginx configuration updated"
echo ""

# Test nginx configuration
echo "Step 2: Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration is valid"
    echo ""
    
    # Reload nginx
    echo "Step 3: Reloading nginx..."
    systemctl reload nginx
    echo "✓ Nginx reloaded successfully"
    echo ""
    
    echo "=== Fix Complete ==="
    echo "Your images should now load correctly at https://urbanhost.in"
    echo ""
    echo "The /uploads directory is now being served directly by nginx,"
    echo "which is faster and more reliable than serving through Next.js"
else
    echo "✗ Nginx configuration test failed!"
    echo "Please check the error messages above"
    exit 1
fi
