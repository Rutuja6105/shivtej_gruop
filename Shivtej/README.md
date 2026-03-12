# शिवतेज Group Finance Manager

Full-stack web app with React frontend + Vercel Serverless API + Supabase PostgreSQL.

## Setup on Vercel

### 1. Upload to GitHub
- Create a new GitHub repository
- Upload all files from this folder

### 2. Deploy on Vercel
- Go to vercel.com → New Project → Import from GitHub
- Framework: Create React App
- Click Deploy

### 3. Add Database Environment Variable
After deploy, go to:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

Add this variable:
- **Name:** `DATABASE_URL`
- **Value:** `postgresql://postgres:[YOUR-PASSWORD]@db.voaniokkktdmpatipdze.supabase.co:5432/postgres`

Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

> Get password from: supabase.com → Project Settings → Database → Database password

### 4. Redeploy
After adding the env variable, go to:
**Vercel → Deployments → Redeploy**

### 5. Done!
Your app is live with real PostgreSQL database. All data persists across devices.

## Default Login
- Username: `treasurer`
- Password: `shivtej@2025`
