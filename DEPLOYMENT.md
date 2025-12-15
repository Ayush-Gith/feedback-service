# Feedback Service - AWS EC2 Deployment Guide

This guide walks through deploying the Feedback Service backend to AWS EC2 with NGINX reverse proxy and PM2 process manager.

**Estimated Time:** 30-45 minutes
**Cost:** Free tier eligible (t2.micro + MongoDB Atlas free)

---

## Prerequisites

- AWS account with free tier access
- SSH client installed (included on macOS/Linux)
- Feedback Service code in Git repository
- MongoDB Atlas account (free tier cluster created)

---

## Phase 1: AWS EC2 Setup

### Step 1.1: Launch Ubuntu EC2 Instance

1. **Log in to AWS Console**
   - Go to https://console.aws.amazon.com
   - Search for "EC2" in search bar
   - Click "EC2 Dashboard"

2. **Launch Instance**
   - Click "Launch Instance" (orange button)
   - Name: `Customer-feedback-service` (or any name)

3. **Select AMI (Operating System)**
   - Choose "Ubuntu Server 22.04 LTS"
   - Architecture: "64-bit (x86)"
   - Free tier eligible ✓

4. **Instance Type**
   - Select: `t2.micro` OR `t3.micro` (both are free tier eligible)
   - ⚠️ If t2.micro unavailable in your region, t3.micro is a perfectly acceptable alternative
   - ⚠️ DO NOT choose any other type like t2.small, t3.small, m5, etc. (costs money)
   
   **Comparison:**
   - **t2.micro:** Older generation, widely available, burstable CPU
   - **t3.micro:** Newer generation, better performance, also burstable, equally free tier eligible
   - **For this project:** Either works fine, no cost difference

5. **Key Pair**
   - Click "Create new key pair"
   - Name: `feedback-service-key` (or any name)
   - Key pair type: RSA
   - Click "Create key pair"
   - **Save the `.pem` file** to safe location (e.g., `~/.ssh/`)
   - Command: `chmod 400 ~/.ssh/feedback-service-key.pem`

6. **Network Settings**
   - VPC: Default VPC
   - Subnet: Default subnet
   - Auto-assign public IP: **Enable** (important!)
   - Create security group (will configure in next step)

7. **Storage**
   - Size: 30GB (free tier allows)
   - Volume type: gp3 (general purpose)
   - Delete on termination: ✓ Checked

8. **Review and Launch**
   - Click "Launch Instance"
   - Wait 2-3 minutes for instance to start

### Step 1.2: Configure Security Groups (Firewall)

1. **Go to Security Groups**
   - EC2 Dashboard → Security Groups (left sidebar)
   - Find the security group created for your instance

2. **Add Inbound Rules**
   - Click "Edit inbound rules"
   - **Rule 1: SSH** (for deployment)
     - Type: SSH
     - Protocol: TCP
     - Port: 22
     - Source: **My IP** (your current IP address)
     - ⚠️ NEVER use 0.0.0.0/0 (public internet)
   
   - **Rule 2: HTTP** (for web traffic)
     - Type: HTTP
     - Protocol: TCP
     - Port: 80
     - Source: 0.0.0.0/0 (allow all, it's public API)
   
   - **Rule 3: HTTPS** (future, if using SSL)
     - Type: HTTPS
     - Protocol: TCP
     - Port: 443
     - Source: 0.0.0.0/0

3. **Keep Outbound Rules Default**
   - Should allow all traffic to internet

4. **Click "Save rules"**

### Step 1.3: Get Instance Public IP

1. Go to EC2 Dashboard → Instances
2. Click on your instance name
3. Copy "Public IPv4 address" (e.g., `54.123.45.67`)
4. Save this IP, you'll use it to SSH

---

## Phase 2: Connect to Instance & Install Software

### Step 2.1: SSH into Instance

```bash
# Move the downloaded key file to your .ssh directory (if not already there)
mv ~/Downloads/feedback-service-key.pem ~/.ssh/
# From your local machine, navigate to key pair location
cd ~/.ssh

# SSH into instance
ssh -i feedback-service-key.pem ubuntu@YOUR_PUBLIC_IP

# Replace YOUR_PUBLIC_IP with actual IP from step 1.3
# Example: ssh -i feedback-service-key.pem ubuntu@54.123.45.67
```

**If you get permission denied:**
```bash
# Make key readable only by you
chmod 400 feedback-service-key.pem
# Then retry SSH command
```

**Success:** You're now logged into Ubuntu as `ubuntu` user

### Step 2.2: Update System Packages

```bash
# Update package list
sudo apt-get update

# Upgrade installed packages
sudo apt-get upgrade -y

# Install essential tools
sudo apt-get install -y curl wget git vim
```

### Step 2.3: Install Node.js (v20 LTS)

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js and npm
sudo apt-get install -y nodejs

# Verify installation
node --version   # Should be v20.x.x
npm --version    # Should be 9.x.x or higher
```

### Step 2.4: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Enable PM2 startup script (auto-start on reboot)
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Verify installation
pm2 --version
```

### Step 2.5: Install NGINX (Reverse Proxy)

```bash
# Install NGINX
sudo apt-get install -y nginx

# Start NGINX
sudo systemctl start nginx

# Enable NGINX on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

**Test NGINX:**
- Open browser: `http://YOUR_PUBLIC_IP`
- You should see NGINX welcome page

---

## Phase 3: Clone & Configure Application

### Step 3.1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone feedback service repository
git clone https://github.com/YOUR_GITHUB_USERNAME/feedback-service.git

# Navigate into project
cd feedback-service

# Install dependencies
npm install
```

**If you get git permission denied:**
```bash
# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter for defaults
# Add key to GitHub: https://github.com/settings/keys

# Or use HTTPS with Personal Access Token instead
```

### Step 3.2: Create .env File

```bash
# Create environment file
nano .env
```

**Paste this content** (update values):

```env
# Server
NODE_ENV=production
PORT=3000
SERVER_HOST=localhost

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/feedback-service?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-very-strong-secret-key-change-this-to-something-secure-minimum-32-characters
JWT_EXPIRY=7d
```

**How to fill:**
1. **MONGODB_URI:** Go to MongoDB Atlas → Cluster → Connect → Copy connection string
   - Replace `<password>` with your MongoDB password
   - Replace `<username>` with your username
   - Ensure IP is whitelisted (0.0.0.0/0 for dev)

2. **JWT_SECRET:** Generate strong random string:
   ```bash
   openssl rand -base64 32
   ```
   - Copy output, paste into JWT_SECRET

3. **Save file:** Press `Ctrl+O`, Enter, `Ctrl+X`

### Step 3.3: Test Application Locally

```bash
# Navigate to project directory (if not already there)
cd ~/feedback-service

# Start application with npm (test)
npm start

# You should see:
# ✓ MongoDB connected successfully
# ✓ Server running on http://localhost:3000
```

**Test endpoints:**
```bash
# In new SSH session, test health check
curl http://localhost:3000/api/health

# Response should be JSON with success: true
```

**Stop app:** Press `Ctrl+C`

---

## Phase 4: Start Application with PM2

### Step 4.1: Start with PM2

```bash
# From project directory
cd ~/feedback-service

# Start application with PM2
pm2 start server.js --name "feedback-service"

# Verify it's running
pm2 status

# View logs
pm2 logs feedback-service
```

### Step 4.2: Configure PM2 Auto-Restart

```bash
# Save PM2 process list
pm2 save

# Create startup script (already done in step 2.4, but verify)
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Test restart
pm2 restart feedback-service

# Check logs
pm2 logs feedback-service --lines 20
```

### Step 4.3: Useful PM2 Commands

```bash
# View all processes
pm2 list

# Restart application
pm2 restart feedback-service

# Stop application
pm2 stop feedback-service

# Start application
pm2 start feedback-service

# View detailed logs
pm2 logs feedback-service

# Monitor in real-time
pm2 monit

# Delete process
pm2 delete feedback-service
```

---

## Phase 5: Configure NGINX Reverse Proxy

### Step 5.1: Create NGINX Configuration

```bash
# Edit NGINX configuration
sudo nano /etc/nginx/sites-available/feedback-service
```

**Paste this configuration:**

```nginx
# Feedback Service Reverse Proxy Configuration

upstream feedback_app {
    # Connect to Node.js app running on port 3000
    server localhost:3000;
}

server {
    # Listen on port 80 (HTTP)
    listen 80 default_server;
    listen [::]:80 default_server;

    # Server domain (replace with your domain or use IP)
    server_name _;

    # Max upload size
    client_max_body_size 10M;

    # Logging
    access_log /var/log/nginx/feedback-service-access.log;
    error_log /var/log/nginx/feedback-service-error.log;

    # Proxy all requests to Node.js app
    location / {
        # Forward request to Node.js
        proxy_pass http://feedback_app;
        
        # Preserve original headers
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Health check endpoint (optional, for monitoring)
    location /health {
        access_log off;
        proxy_pass http://feedback_app;
    }
}
```

**Save file:** `Ctrl+O`, Enter, `Ctrl+X`

### Step 5.2: Enable Configuration

```bash
# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/feedback-service /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test NGINX configuration (check for syntax errors)
sudo nginx -t

# Should output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 5.3: Reload NGINX

```bash
# Reload NGINX with new configuration
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/feedback-service-error.log
```

---

## Phase 6: Test Deployment

### Step 6.1: Test via Public IP

```bash
# From your local machine (not SSH session), test API
curl http://YOUR_PUBLIC_IP/api/health

# Should return JSON response with success: true
```

### Step 6.2: Test with Postman

1. Import Postman collection
2. Change baseUrl from `http://localhost:3000/api` to `http://YOUR_PUBLIC_IP/api`
3. Run all test cases
4. Verify all endpoints work

### Step 6.3: Check Logs

```bash
# SSH into instance, check PM2 logs
pm2 logs feedback-service

# Check NGINX error logs
sudo tail -f /var/log/nginx/feedback-service-error.log

# Check NGINX access logs
sudo tail -f /var/log/nginx/feedback-service-access.log
```

---

## Phase 7: Post-Deployment Tasks

### Step 7.1: Enable Auto-Shutdown (Cost Saving)

```bash
# Create shutdown script
sudo nano /home/ubuntu/shutdown.sh
```

**Paste:**
```bash
#!/bin/bash
# Shutdown EC2 instance at 2 AM daily
0 2 * * * /opt/aws/bin/ec2-instance-id | xargs -I {} aws ec2 stop-instances --instance-ids {} --region us-east-1
```

**Alternative:** Use AWS Systems Manager for scheduled shutdowns

### Step 7.2: Monitor Application

```bash
# SSH into instance, monitor with PM2
pm2 monit

# This shows CPU, memory, uptime in real-time
# Press 'q' to quit
```

### Step 7.3: Set Up Monitoring Alerts

1. Go to AWS CloudWatch
2. Create alarm for:
   - CPU > 50%
   - Network out > 500MB
3. Email notification when triggered

### Step 7.4: Backup Database

MongoDB Atlas automatically backs up free tier, but verify:
1. Go to MongoDB Atlas Cluster → Backup
2. Verify snapshots are created

---

## Phase 8: Troubleshooting

### Application not running
```bash
# SSH into instance
pm2 logs feedback-service

# Check if port 3000 is in use
sudo lsof -i :3000

# Check if PM2 process died
pm2 status

# Restart if dead
pm2 start src/server.js --name "feedback-service"
```

### NGINX not proxying correctly
```bash
# Test NGINX config
sudo nginx -t

# Check NGINX error log
sudo tail -50 /var/log/nginx/feedback-service-error.log

# Reload NGINX
sudo systemctl reload nginx
```

### Connection to MongoDB fails
```bash
# Check MongoDB URI in .env
cat ~/.env | grep MONGODB_URI

# Verify IP is whitelisted in MongoDB Atlas:
# Cluster → Network Access → Whitelist your IP (0.0.0.0/0 for dev)

# Test connection
pm2 logs feedback-service | grep -i mongodb
```

### 502 Bad Gateway error
- Node.js app crashed: `pm2 logs feedback-service`
- NGINX can't reach app on :3000: Check app is running (`pm2 status`)
- Firewall blocking: Check security groups in AWS

### Out of free tier
- Check EC2 costs: AWS Billing Dashboard
- Check if running non-t2.micro instance
- Stop unused instances immediately
- Review data transfer (downloads to local = charges)

---

## Quick Reference

### Useful Commands

```bash
# View application logs
pm2 logs feedback-service

# Restart application
pm2 restart feedback-service

# View NGINX logs
sudo tail -f /var/log/nginx/feedback-service-error.log

# Reload NGINX
sudo systemctl reload nginx

# Check running processes
pm2 status

# SSH into instance
ssh -i ~/.ssh/feedback-service-key.pem ubuntu@YOUR_PUBLIC_IP

# SCP file to instance
scp -i ~/.ssh/feedback-service-key.pem file.txt ubuntu@YOUR_PUBLIC_IP:~/

# Pull latest code
cd ~/feedback-service && git pull && npm install && pm2 restart feedback-service
```

### Firewall Rules Summary

| Port | Service | Source | Purpose |
|------|---------|--------|---------|
| 22 | SSH | Your IP Only | Deployment & management |
| 80 | HTTP | 0.0.0.0/0 | Public API access |
| 443 | HTTPS | 0.0.0.0/0 | Future SSL/TLS |
| 3000 | Node.js | Localhost Only | NGINX proxy target |

---

## Final Checklist

- [ ] EC2 instance running (t2.micro, free tier)
- [ ] Security groups configured (SSH from your IP, HTTP/HTTPS public)
- [ ] Node.js installed and verified
- [ ] PM2 installed and auto-startup enabled
- [ ] NGINX installed and reverse proxy configured
- [ ] Code cloned from GitHub
- [ ] .env file created with valid MongoDB URI
- [ ] Application running on port 3000
- [ ] NGINX proxying to app on :3000
- [ ] Public API responding on http://YOUR_PUBLIC_IP/api/health
- [ ] Postman tests passing
- [ ] MongoDB connection verified
- [ ] Auto-shutdown configured (cost saving)
- [ ] Billing alerts set to $1

---

## Next Steps

1. **Purchase Domain** (optional)
   - Point domain to EC2 public IP via DNS
   - Configure NGINX to use domain

2. **Enable HTTPS/SSL** (recommended)
   - Use Let's Encrypt (free)
   - Command: `sudo apt-get install certbot python3-certbot-nginx`
   - `sudo certbot --nginx -d yourdomain.com`

3. **Set Up CI/CD**
   - GitHub Actions to auto-deploy on push
   - Script: Pull code, install, restart PM2

4. **Monitor & Scale**
   - CloudWatch metrics
   - Auto-restart failed processes
   - Load testing with larger instance if needed

---

**Congratulations!** Your Feedback Service is deployed and live on AWS EC2. 🎉

For questions or issues, check logs and refer to troubleshooting section.
