# Fullstack CRUD Application (React + Node.js Express + PostgreSQL)

A modern full-stack web application for user management with full CRUD capabilities (Create, Read, Update, Delete), real-time search, statistics, and containerized deployment readiness.

- **Frontend**: React 18, Vite, Lucide Icons, Custom Modern CSS (Port `3000`)
- **Backend**: Node.js, Express, `pg` (PostgreSQL client), `dotenv`, CORS (Port `5050`)
- **Database**: PostgreSQL (Port `5432`)
- **Deployment**: Docker, Docker Compose, AWS EC2, AWS RDS, AWS S3/CloudFront

---

## ⚡ Quick Start (Local Setup)

### Option A: Running with Local Node & PostgreSQL

#### 1. Setup PostgreSQL Database
Make sure PostgreSQL is running on your machine, then run the database initialization script:
```bash
# Navigate to backend and run DB initialization
cd backend
npm run db:init
```
*(This automatically creates the `api` database, `users` table, and seeds test data).*

#### 2. Start the Backend API
```bash
cd backend
npm run dev
```
Backend will be live at: `http://localhost:5050` (Health check: `http://localhost:5050/health`)

#### 3. Start the Frontend Application
Open a new terminal:
```bash
cd frontend
npm run dev
```
Frontend will be live at: `http://localhost:3000`

---

### Option B: Running with Docker Compose (One-Command)
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5050`
- PostgreSQL: `localhost:5432`

---

## ☁️ AWS Deployment

Detailed step-by-step instructions for deploying to AWS (EC2 + Docker or AWS RDS + App Runner/EC2 + S3) are available in:
👉 **[AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)**

### Quick EC2 Deployment Summary:
1. Launch an Ubuntu EC2 instance (`t2.micro` or `t3.small`) with ports `22`, `80`, `3000`, `5050` open.
2. SSH into EC2 and install Docker:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   ```
3. Clone repo and run:
   ```bash
   git clone https://github.com/bethechange35809/fullstack-react-node-postgreSQL.git
   cd fullstack-react-node-postgreSQL
   docker compose up -d --build
   ```
4. Access the app via `http://<EC2_PUBLIC_IP>:3000`.
