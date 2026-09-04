# AWS Deployment Guide: Fullstack React + Node.js + PostgreSQL

This guide provides comprehensive, step-by-step instructions for deploying this fullstack application to Amazon Web Services (AWS).

---

## 🚀 Option 1: Quick Deployment on AWS EC2 with Docker (Recommended for quick start)

In this approach, your frontend, backend, and PostgreSQL database run in isolated containers managed by `docker-compose` on a single AWS EC2 instance.

### Step 1: Launch an AWS EC2 Instance
1. Log into your **AWS Management Console** and navigate to **EC2**.
2. Click **Launch Instance**:
   - **Name**: `fullstack-crud-app`
   - **AMI**: Ubuntu Server 22.04 LTS or Amazon Linux 2023
   - **Instance Type**: `t2.micro` or `t3.small` (Free tier eligible: `t2.micro`)
   - **Key Pair**: Select or create a new key pair (download the `.pem` file).
3. **Configure Security Group**:
   Allow the following inbound rules:
   | Type | Protocol | Port Range | Source | Purpose |
   | :--- | :--- | :--- | :--- | :--- |
   | SSH | TCP | 22 | My IP | Secure SSH Terminal |
   | HTTP | TCP | 80 | 0.0.0.0/0 | Public Web Traffic |
   | Custom TCP | TCP | 3000 | 0.0.0.0/0 | React Frontend |
   | Custom TCP | TCP | 5050 | 0.0.0.0/0 | Express Backend API |

4. Click **Launch Instance**.

---

### Step 2: Connect to your EC2 Instance
Open your terminal and SSH into the instance:
```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

### Step 3: Install Docker & Docker Compose on EC2
Run the following commands on the EC2 instance:
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io docker-compose

# Start Docker and enable it to start on boot
sudo systemctl start docker
sudo systemctl enable docker

# Allow current user to run docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

### Step 4: Clone the Repository & Configure Environment
```bash
# Clone repository
git clone https://github.com/bethechange35809/fullstack-react-node-postgreSQL.git
cd fullstack-react-node-postgreSQL

# Edit the frontend build argument if you want browser clients to hit your EC2 IP directly:
# In docker-compose.yml, set VITE_API_URL: http://<YOUR_EC2_PUBLIC_IP>:5050
```

---

### Step 5: Start the Application with Docker Compose
```bash
# Build and run containers in background
docker compose up -d --build

# View container logs
docker compose logs -f
```

Visit in your browser:
- **Frontend**: `http://<YOUR_EC2_PUBLIC_IP>:3000`
- **Backend API**: `http://<YOUR_EC2_PUBLIC_IP>:5050`
- **Backend Health Check**: `http://<YOUR_EC2_PUBLIC_IP>:5050/health`

---

## 🛡️ Option 2: Production-Grade Deployment (AWS RDS + EC2/App Runner + S3/CloudFront)

For high-traffic, production-grade applications with managed backups, SSL, and CDN caching:

### 1. Database: AWS RDS (PostgreSQL)
1. Go to **AWS RDS Console** -> **Create Database**.
2. Select **PostgreSQL** -> Version 15 or 16.
3. Template: **Free tier** (db.t3.micro / db.t4g.micro).
4. Master username: `postgres` and set a secure password.
5. In **Connectivity**:
   - Make it **Publicly accessible** (if connecting from external IP) OR place in the same VPC as your EC2 backend.
   - Attach a Security Group that allows inbound TCP on port `5432` from your EC2 security group.
6. Initial Database Name: `api`.
7. Once created, copy the **RDS Endpoint** (e.g. `mydb.cxxxx.us-east-1.rds.amazonaws.com`).

---

### 2. Backend: AWS EC2 / AWS App Runner
In your backend `.env` or EC2 environment variables:
```env
DB_HOST=mydb.cxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_rds_password
DB_NAME=api
DB_SSL=true
PORT=5050
```
Run the database initializer on the backend:
```bash
npm run db:init
npm start
```

---

### 3. Frontend: AWS S3 + CloudFront (Static Hosting)
1. Build the frontend locally or in CI/CD with your production backend URL:
   ```bash
   cd frontend
   VITE_API_URL=https://api.yourdomain.com npm run build
   ```
2. Create an **AWS S3 Bucket** (e.g. `my-fullstack-frontend`).
3. Upload all files from `frontend/dist/` into the S3 bucket.
4. Enable **Static Website Hosting** on the S3 bucket or create an **AWS CloudFront Distribution** pointing to the S3 bucket.
5. Configure CloudFront Error Pages:
   - Error code `404` and `403` -> Redirect to `/index.html` with HTTP `200 OK` (required for Single-Page React Apps).

---

## 🔒 Security Best Practices Checklist for AWS
- [ ] **Never commit `.env` files with production passwords** to GitHub.
- [ ] Restrict database Security Group (port `5432`) to only accept connections from the backend EC2 / App Runner IP.
- [ ] Use **AWS Secrets Manager** or **AWS Parameter Store** for storing database credentials in enterprise setups.
- [ ] Setup an Nginx reverse proxy with **Let's Encrypt SSL (Certbot)** for `https://` domain access.
