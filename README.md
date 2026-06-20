# CampusReuse ♻️

CampusReuse is an AI-powered campus marketplace that enables students to buy, sell, exchange, and discover second-hand products within their college community. The platform provides secure authentication, intelligent recommendations, semantic search capabilities, buyer-seller communication, and cloud-based deployment infrastructure.

## 🚀 Features

### 🔐 Authentication & Security
- **Google OAuth 2.0 Login**
- **JWT-based Authentication & Authorization**
- Protected API endpoints and role-based access control
- Secure buyer-seller interactions without exposing personal contact information

### 🛍 Marketplace Functionality
- Create, update, and manage product listings
- Product categories and filtering
- Product search and discovery
- Product image uploads securely backed by **AWS S3**
- Product availability management
- **Saved/Liked Items** functionality with an intuitive UI

### 💬 Communication System
- Buyer-Seller inquiry system
- Secure in-platform messaging
- **Seller Email Notifications** automatically triggered when users express interest in products
- Notification management system

### 🤖 AI-Powered Features
- **Recommendation Engine**: Uses Cosine Similarity to suggest personalized products based on user interactions and view-history
- **Semantic Search**: NLP-based search for meaning-based product discovery (e.g., searching "power brick" finds "Laptop Charger")

### ⚡ Performance Optimization
- **Redis Caching**: Caches frequently accessed product data, listings, and search results
- Significantly reduced database load and faster API response times

### ☁️ Cloud & DevOps
- Fully containerized with **Docker**
- **AWS EC2** deployment
- **AWS S3** image storage
- **GitHub Actions** CI/CD pipeline for automated testing and building
- **Nginx** reverse proxy configuration

---

## 🛠 Tech Stack

**Frontend:**
React.js | TypeScript | Vite | Tailwind CSS

**Backend:**
Spring Boot | Spring Security | JWT Authentication | Spring Data JPA | Hibernate

**Database & Caching:**
PostgreSQL | Redis

**AI & NLP:**
Cosine Similarity Recommendation Engine | Sentence Transformers | Semantic Search

**Cloud & DevOps:**
AWS EC2 | AWS S3 | Docker | Nginx | GitHub Actions

---

## 📊 Database Design

The platform uses a normalized PostgreSQL schema consisting of multiple relational entities:
`User` | `Product` | `Category` | `Inquiry` | `ProductView` | `Review` | `SavedItem` | `Notification`

These entities support marketplace operations, recommendation generation, user engagement tracking, and product discovery workflows.

---

## 🏗 System Architecture

```text
┌──────────────┐
│ React Frontend│
└──────┬───────┘
       │ REST APIs
       ▼
┌───────────────────┐
│ Spring Boot Backend│
└──────┬─────┬──────┘
       │     │
       │     ├────────────► Redis Cache
       │
       ├────────────► PostgreSQL
       │
       ├────────────► AWS S3
       │
       ├────────────► Gmail SMTP
       │
       └────────────► NLP Service
                       (Semantic Search)
```

---

## 🚀 Deployment

The application is containerized using Docker and deployed on AWS EC2.

**Services:**
- Frontend (React + Nginx)
- Backend (Spring Boot)
- PostgreSQL
- Redis
- NLP Service

**Deployment Workflow:**
`GitHub Push` → `GitHub Actions` → `Build Verification` → `Docker Deployment` → `AWS EC2`

---

## 📂 Project Structure

```text
CampusReuse/
│
├── frontend/             # React SPA, Vite config, Nginx proxy
├── backend/              # Spring Boot application, REST APIs
├── nlp-service/          # Python-based Semantic Search API
├── docker-compose.yml    # Multi-container orchestration
├── .github/workflows/    # CI/CD Pipeline config
└── README.md
```

---

## 🔧 Running Locally

Clone the repository:
```bash
git clone https://github.com/adityaj150/campusReuse.git
cd campusReuse
```

Start all services:
```bash
docker compose up -d --build
```

**Access:**
- Frontend: `http://localhost`
- Backend: `http://localhost:8080`

---

## 📈 Future Enhancements
- [ ] Advanced recommendation algorithms
- [ ] Personalized user dashboards
- [ ] Real-time chat using WebSockets
- [ ] Fraud and spam detection
- [ ] Mobile application support
- [ ] Analytics dashboard
- [ ] Campus-specific communities

---

## 👨‍💻 Author

**Aditya Jadhav**  
*Computer Science Engineering*  
*COEP Technological University*

⭐ **If you found this project interesting, consider giving it a star!**
