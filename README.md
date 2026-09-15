# 🌿 Wild Tour Karnataka — Eco-Tourism & Wildlife Safari Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Mongoose_v8-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-v8.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> A production-ready, enterprise-grade full-stack MERN platform engineered for booking wildlife safaris, jungle eco-resorts, certified naturalist guides, and curated wilderness experiences across Karnataka's premier national parks and reserves.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
  - [Traveler Experience](#-traveler-experience)
  - [Administrative & Checkpost Suite](#-administrative--checkpost-suite)
  - [Security & Architecture](#-security--architecture)
- [Technology Stack](#-technology-stack)
- [Database Schema & Data Models](#-database-schema--data-models)
- [REST API Specifications](#-rest-api-specifications)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Seeding](#database-seeding)
  - [Running the Application](#running-the-application)
- [Deployment on Render](#-deployment-on-render)
- [Security Hardening](#-security-hardening)
- [Project Directory Structure](#-project-directory-structure)
- [License](#-license)

---

## 🌟 Overview

**Wild Tour Karnataka** addresses the operational and reservation challenges of eco-tourism sanctuaries (e.g., Nagarhole, Bandipur, Kabini, BRT, and Dandeli). The platform combines real-time slot scheduling, gate verification checkposts, role-based administration, automated email confirmations, and digital boarding pass generation.

Built with a **Micro-Service Ready MERN Architecture**, the application decouples the client Vite SPA from the Express REST API, allowing scalable independent deployment on CDNs and serverless/container runtimes.

---

## 🏛️ System Architecture

```
                                  +---------------------------------------+
                                  |            Client Layer               |
                                  |    React 19 + Vite SPA (Render CDN)   |
                                  +-------------------+-------------------+
                                                      |
                                           HTTPS / JSON REST API
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |            API Gateway                |
                                  |  Express.js + Helmet + CORS + Limiter |
                                  +-------------------+-------------------+
                                                      |
               +--------------------------------------+--------------------------------------+
               |                                      |                                      |
               v                                      v                                      v
  +--------------------------+           +--------------------------+           +--------------------------+
  |    Auth & RBAC Module    |           |   Booking & Gate Engine  |           |   Catalog & Inventory    |
  | JWT / Google OAuth / OTP |           | Slot Manager & Ticketing |           |  Safaris, Stays, Guides  |
  +------------+-------------+           +------------+-------------+           +------------+-------------+
               |                                      |                                      |
               +--------------------------------------+--------------------------------------+
                                                      |
                                           Mongoose ODM (Pool v8)
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |            Database Layer             |
                                  |       MongoDB Atlas Cloud (M0)        |
                                  +---------------------------------------+
```

---

## ✨ Key Features

### 🌲 Traveler Experience
- **Dynamic Safari Booking Engine**: Choose vehicles (4x4 Jeep, Canopy Cantour, Lagoon Boat), select shift timings (Dawn/Dusk), and check real-time seat inventory.
- **Eco-Resort & Jungle Lodge Reservations**: High-resolution image galleries, amenities breakdown, geolocation badges, and night-based pricing.
- **Certified Naturalist Guide Directory**: Filter guides by language, biodiversity expertise, years of experience, and hourly pricing.
- **Digital Boarding Pass & QR-Ready Ticketing**: Generates printable and downloadable boarding passes with verification tokens and automated email delivery.
- **Wildlife Catalog & Sighting Intel**: In-depth information on Karnataka's flagship fauna (Kabini Black Panther, Royal Bengal Tiger, Asian Elephant, Malabar Giant Squirrel).
- **Personalized Wishlist & Saved Trips**: Save experiences for future bookings with real-time sync across sessions.
- **Verified Review Engine**: Multi-criteria star ratings and authentic verified guest testimonials.

### 🛡️ Administrative & Checkpost Suite
- **Analytics & Revenue KPI Dashboard**: Live transaction volume, monthly performance graphs, occupancy trends, and category distribution.
- **Gate Checkpost Terminal**: Real-time boarding pass lookup and instant barcode/ticket validation for sanctuary rangers.
- **Inventory CRUD Management**: Full administrative control to create, update, price, and disable safaris, lodges, guides, and packages.
- **Automated CSV Export**: Instant financial and guest manifest reports formatted for forestry compliance.
- **Audit Logging**: Comprehensive admin activity tracking with timestamps and IP logging.

### 🔒 Security & Architecture
- **JWT & Role-Based Access Control (RBAC)**: Enforces role permissions (`traveler`, `operator`, `admin`).
- **Google OAuth 2.0 Integration**: Direct Google sign-in alongside traditional email + OTP signup.
- **Enterprise Rate Limiting**: Anti-brute force throttling on auth endpoints using sliding windows.
- **Helmet CSP Hardened**: Custom Content Security Policy forbidding inline script injections and unauthorized origins.
- **Normalized CORS Layer**: Dynamic multi-origin verification with trailing slash normalization.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (`19.2.8`) | Reactive UI rendering & Component Architecture |
| **Frontend Tooling** | Vite (`8.2.2`) | Ultra-fast HMR and production bundling |
| **Icons & Visuals** | Lucide React + Canvas Confetti | Modern UI icons & celebratory micro-interactions |
| **Backend Runtime** | Node.js (`v18+` / `v20+`) | Asynchronous server execution runtime |
| **Web Framework** | Express.js (`4.21.2`) | RESTful routing, middleware, and controller pipeline |
| **Database & ODM** | MongoDB + Mongoose (`8.9.2`) | Schema-based document persistence & indexing |
| **Authentication** | JSON Web Tokens (`9.0.2`) + Bcrypt.js | Cryptographic stateless sessions & password hashing |
| **Third-Party Auth** | Google Auth Library (`11.0.2`) | Google OAuth 2.0 Identity Token verification |
| **Email Service** | Nodemailer (`9.0.5`) | Transactional booking passes & OTP verification |
| **Security Suite** | Helmet (`8.3.0`) + Express Rate Limit (`8.7.0`) | Security headers (CSP) & DDOS / Brute-force protection |
| **Cloud Hosting** | Render | Automated CI/CD, Static Site CDN & Node Web Services |

---

## 🗄️ Database Schema & Data Models

The system architecture utilizes 9 specialized Mongoose schemas:

```text
├── User             # Identity, credentials, verification state, RBAC roles (traveler/admin/operator)
├── Safari           # Sanctuary locations, shift schedules, vehicle types, max capacity, pricing
├── SafariSlot       # Date/Shift-specific seat allotment, concurrency reservation locks
├── Stay             # Jungle resort listings, room configurations, amenities, nightly rates
├── Package          # Multi-day comprehensive tour itineraries, inclusions, meal plans
├── Guide            # Naturalist profiles, language proficiencies, certifications, fees
├── Booking          # Transaction records, guest counts, pricing breakdown, gate check-in status
├── Review           # Verified traveler ratings (1-5), comments, and review timestamps
├── Contact          # User inquiries, support dispatches, and resolution statuses
└── AdminLog         # Immutable audit trail tracking administrative modifications
```

---

## 📡 REST API Specifications

### Authentication & User Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new traveler account and dispatch OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify 6-digit registration OTP token |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue signed JWT |
| `POST` | `/api/auth/google` | Public | Authenticate via Google OAuth 2.0 credential |
| `POST` | `/api/auth/forgot-password` | Public | Dispatch password reset OTP |
| `POST` | `/api/auth/reset-password` | Public | Reset account password via verified OTP |
| `GET` | `/api/auth/me` | Traveler | Fetch authenticated profile details |
| `PUT` | `/api/auth/profile` | Traveler | Update user profile and contact information |

### Booking & Gate Operations (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Traveler | Create new reservation with seat lock |
| `GET` | `/api/bookings/my` | Traveler | Retrieve user booking history & passes |
| `GET` | `/api/bookings/:id` | Traveler | Fetch specific ticket & boarding pass |
| `PUT` | `/api/bookings/:id/cancel`| Traveler | Request trip cancellation & process refund logic |
| `POST` | `/api/bookings/check-in/:id`| Operator/Admin| Gate check-in verification for ranger terminal |
| `GET` | `/api/bookings/admin/all` | Admin | Query all bookings with search/filter/pagination |
| `GET` | `/api/bookings/admin/analytics`| Admin | Retrieve revenue metrics, occupancy & chart stats |
| `GET` | `/api/bookings/admin/export-csv`| Admin | Stream CSV file of filtered booking records |

### Inventory & Content Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/safaris` | Public | List published safaris with query filters |
| `POST` | `/api/safaris` | Admin | Create new safari tour listing |
| `GET` | `/api/stays` | Public | List luxury eco-stays and tented lodges |
| `POST` | `/api/stays` | Admin | Create new jungle lodge entry |
| `GET` | `/api/guides` | Public | Browse verified naturalist directory |
| `GET` | `/api/packages` | Public | Explore multi-day safari tour packages |
| `GET` | `/api/wildlife` | Public | Fetch sanctuary fauna and sighting catalog |
| `GET` | `/api/reviews/item/:id` | Public | Read verified customer reviews for an item |
| `POST` | `/api/reviews` | Traveler | Submit rating and review after confirmed trip |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (`v18.0.0` or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Account or local MongoDB server (`v6.0+`)
- [Git](https://git-scm.com/)

---

### Installation

Clone the repository to your local workstation:

```bash
git clone https://github.com/<your-username>/wildtour-mernstack.git
cd wildtour-mernstack
```

Install dependencies for both client and server:

```bash
# 1. Install Backend Dependencies
cd server
npm install

# 2. Install Frontend Dependencies
cd ../client
npm install
```

---

### Environment Configuration

#### 1. Backend Configuration (`server/.env`)
Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/wildtour_db
JWT_SECRET=super_secure_jwt_secret_key_32_characters_minimum
FRONTEND_URL=http://localhost:5173

# Optional: Email SMTP (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="Wild Tour Karnataka" <noreply@wildtour.com>

# Optional: Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### 2. Frontend Configuration (`client/.env`)
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

### Database Seeding

Populate your database with realistic demo data (admin credentials, safaris, stays, guides, and packages):

```bash
cd server
npm run seed
```

**Default Seeded Credentials:**
- 👑 **Admin Portal**: `admin@wildtour.com` / `Admin@123456`
- 🎒 **Traveler Account**: `traveler@wildtour.com` / `Traveler@123456`

---

### Running the Application

Open two terminal windows:

```bash
# Terminal 1: Run Express Server (Port 5000)
cd server
npm run dev

# Terminal 2: Run Vite Dev Server (Port 5173)
cd client
npm run dev
```

Open your browser at `http://localhost:5173` to explore the application.

---

## 🌐 Deployment on Render

This repository includes a pre-configured [render.yaml](render.yaml) Blueprint for instant 1-click cloud deployment.

### Quick Deploy:
1. Push this repository to **GitHub**.
2. Open [Render Dashboard](https://dashboard.render.com) $\rightarrow$ Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your repository.
4. Set your `MONGO_URI` (from MongoDB Atlas).
5. Click **Apply** — Render will automatically build and host the Node API and Vite Static Site!

For complete step-by-step setup and free-tier tips, view the [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md).

---

## 🔐 Security Hardening

- **Stateless Bearer Tokens**: Authenticated routes verify HMAC SHA-256 JWT tokens.
- **Password Hashing**: Passwords undergo Bcrypt salt stretching with 10 salt rounds before persistence.
- **Injection Mitigation**: Mongoose schema sanitization protects against NoSQL query injections.
- **CSP (Content Security Policy)**: Whitelists Google Fonts, Google OAuth, and secure image CDNs (Unsplash/Google).
- **Graceful Error Envelope**: Stack traces and internal server identifiers are suppressed in production mode.

---

## 📁 Project Directory Structure

```text
wildtour-mernstack/
├── client/                     # Frontend Application (React 19 + Vite)
│   ├── public/                 # Static assets, icons, and hero photography
│   ├── src/
│   │   ├── components/         # Reusable UI (Cards, Modals, Navbar, Footer, Skeletons)
│   │   ├── context/            # Global State (AuthContext, ToastContext, WishlistContext)
│   │   ├── pages/              # Views (Home, Safaris, Stays, Packages, Guides, BoardingPass)
│   │   │   └── admin/          # Admin Suite (Dashboard, TripManagement, Checkpost Terminal)
│   │   ├── services/           # Centralized API Fetch layer (`api.js`)
│   │   ├── App.jsx             # React Router v7 route definitions
│   │   ├── index.css           # Global typography, color tokens, and utility styles
│   │   └── main.jsx            # React root entry point
│   ├── index.html              # HTML5 root with SEO meta tags & preconnect fonts
│   ├── package.json            # Frontend dependency manifest
│   └── vite.config.js          # Vite build pipeline & React plugin configuration
│
├── server/                     # Backend Application (Node.js + Express REST API)
│   ├── config/                 # Database connection & shared constants
│   ├── controllers/            # Controller business logic (Auth, Booking, Safari, Stay, etc.)
│   ├── middleware/             # Security middleware (Auth, Admin guards, Rate limiters)
│   ├── models/                 # Mongoose schemas (User, Booking, Safari, Stay, Guide, Log)
│   ├── routes/                 # Express route definitions
│   ├── seed/                   # Database seed scripts & sample asset datasets
│   ├── services/               # Specialized services (Pricing engine, Cancellation logic)
│   ├── utils/                  # Nodemailer email templates and helper functions
│   ├── package.json            # Backend dependency manifest
│   └── server.js               # Express application initialization & middleware stack
│
├── .gitignore                  # Git exclusions (node_modules, .env, dist)
├── render.yaml                 # Infrastructure as Code (IaC) Render Blueprint
├── RENDER_DEPLOYMENT_GUIDE.md  # Comprehensive deployment manual
└── README.md                   # Enterprise documentation (this file)
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

**Developed with 🌿 for Wildlife Tourism & Conservation in Karnataka.**
