# 🚀 Wild Tour Karnataka - Render Deployment Guide

This comprehensive guide walks you through deploying the **Wild Tour Karnataka** MERN stack application onto [Render](https://render.com) with a free cloud database on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

---

## 🏗️ Architecture Overview

| Component | Platform / Service | Plan | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | Render Static Site | Free | React 19 + Vite SPA with global CDN & auto-SSL |
| **Backend API** | Render Web Service | Free | Node.js / Express REST API with health check |
| **Database** | MongoDB Atlas | Free (M0) | 512 MB Cloud MongoDB with automated backups |

---

## 📋 Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

Render provides compute services, so your database will live on MongoDB Atlas:

1. **Sign Up / Log In**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and log in.
2. **Create a Database Cluster**:
   - Choose **M0 Free Cluster**.
   - Select your preferred cloud provider & region (e.g., AWS / Mumbai or Singapore).
   - Click **Create Deployment**.
3. **Set Up Database User Credentials**:
   - Create a username (e.g. `wildtour_admin`) and a secure password.
   - **Save your password securely!**
4. **Configure Network Access (Crucial)**:
   - In MongoDB Atlas, go to **Network Access** (under Security in the left sidebar).
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render's dynamic IP addresses can connect.
   - Click **Confirm**.
5. **Get Your Connection String**:
   - Go to **Database** -> Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection URI. It will look like:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/wildtour_db?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<username>` and `<password>` with your actual credentials and ensure the database name `wildtour_db` is specified.

---

## 💻 Step 2: Push Your Code to GitHub

If you haven't pushed your code to GitHub yet:

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `wildtour-mernstack`).
2. Run the following in your local terminal:
   ```bash
   git init
   git add .
   git commit -m "Prepare Wild Tour MERN stack for Render deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/wildtour-mernstack.git
   git push -u origin main
   ```

---

## ⚡ Step 3: Deploy on Render

You can deploy using either **Method A (1-Click Blueprint)** or **Method B (Manual Dashboard Setup)**.

---

### 🔹 Method A: 1-Click Render Blueprint (Recommended)

This repository includes a pre-configured [render.yaml](file:///c:/Users/GANESH%20K%20S/Desktop/wildtour%20mernstack/render.yaml) blueprint.

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** at the top right and select **Blueprint**.
3. Connect your GitHub repository (`wildtour-mernstack`).
4. Render will detect `render.yaml` and configure both the backend API and frontend Static Site.
5. In the configuration screen, provide:
   - `MONGO_URI`: Paste your MongoDB Atlas connection string from Step 1.
6. Click **Apply**.
7. Once both services are created:
   - Go to your backend service (`wildtour-api`), copy its URL (e.g. `https://wildtour-api.onrender.com`).
   - Go to your frontend service (`wildtour-frontend`) -> **Environment** tab -> Set `VITE_API_URL` to `https://wildtour-api.onrender.com/api`.
   - Trigger a **Manual Deploy** -> **Clear build cache & deploy** on the frontend service.

---

### 🔹 Method B: Manual Dashboard Setup

If you prefer to configure each service manually in the Render UI:

#### 1. Deploy the Backend Web Service

1. On the Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `wildtour-api`
   - **Region**: Choose the region closest to you (e.g. Singapore or Frankfurt)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Advanced** -> **Add Environment Variables**:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `MONGO_URI` | `mongodb+srv://...` | Your Atlas connection string |
   | `JWT_SECRET` | *(Generate a 32+ character random string)* | Auth token signing |
   | `FRONTEND_URL` | `https://wildtour-frontend.onrender.com` | (Fill this with your frontend URL once created) |
   | `PORT` | `10000` | (Render sets this automatically) |

5. Under **Health Check Path**, enter: `/api/health`.
6. Click **Create Web Service**.
7. Copy your backend URL (e.g., `https://wildtour-api.onrender.com`).

---

#### 2. Deploy the Frontend Static Site

1. On the Render Dashboard, click **New +** -> **Static Site**.
2. Connect the same GitHub repository.
3. Configure the settings:
   - **Name**: `wildtour-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Expand **Advanced** -> **Add Environment Variables**:

   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://wildtour-api.onrender.com/api` *(Your backend URL + `/api`)* |
   | `VITE_GOOGLE_CLIENT_ID` | *(Optional: Your Google Cloud Client ID)* |

5. **Configure SPA Rewrite Rule (Essential for React Router)**:
   - In your Static Site settings, go to **Redirects / Rewrites**.
   - Click **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   - Click **Save Changes**. (This ensures refreshing pages like `/stays` or `/admin` won't return 404).
6. Click **Create Static Site**.

---

## 📦 Step 4: Seed Initial Data to MongoDB Atlas

To populate your live MongoDB Atlas database with starter safaris, eco-stays, verified guides, packages, and admin users:

From your local machine, run:
```bash
# In the server directory:
cd server

# Set your Atlas URI temporarily and run seed:
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/wildtour_db?retryWrites=true&w=majority" npm run seed
```

This will automatically create:
- Admin account: `admin@wildtour.com` / `Admin@123456`
- Sample user: `traveler@wildtour.com` / `Traveler@123456`
- Safari tours, eco-stays, verified naturalist guides, and curated packages.

---

## ⚙️ Step 5: Optional Integrations

### 1. Gmail SMTP (For Email Verification & Booking Confirmations)
Add these variables to your Backend Web Service on Render:
- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_USER`: `your_email@gmail.com`
- `SMTP_PASS`: *(Your 16-character Google App Password)*
- `EMAIL_FROM`: `"Wild Tour Karnataka" <noreply@wildtour.com>`

### 2. Google OAuth 2.0
In [Google Cloud Console](https://console.cloud.google.com/) -> **Credentials**:
- Add your Render frontend URL (`https://wildtour-frontend.onrender.com`) to:
  - **Authorized JavaScript origins**
  - **Authorized redirect URIs**

---

## 🔍 Verification & Health Check

1. **API Health**: Visit `https://wildtour-api.onrender.com/api/health` in your browser. You should see:
   ```json
   {
     "status": "online",
     "app": "Wild Tour Karnataka - Eco-Tourism Booking API Server",
     "environment": "production"
   }
   ```
2. **Frontend**: Open `https://wildtour-frontend.onrender.com` to explore the full application!

---

## 💡 Important Render Free Tier Tips

> [!NOTE]
> **Free Tier Sleep/Spin-down Behavior**:
> Render's free Web Services automatically spin down after 15 minutes of inactivity. The first request after sleep may take ~30–45 seconds to wake up the server. This is normal behavior on free hosting. Static sites remain instant at all times.
