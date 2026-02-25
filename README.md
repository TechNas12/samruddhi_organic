# Samruddhi Organics 🌿

Welcome to the **Samruddhi Organics** commerce platform! A modern, highly scalable, full-stack digital storefront tailored to showcase, manage, and distribute premium organic products.

This repository features a complete E-commerce suite, built from the ground up focusing on **performance**, **aesthetic design**, and a **robust administrative ecosystem**.

---

## 🛠 Tech Stack

### Frontend Architecture
- **React.js**: A high-performance, component-based user interface.
- **Tailwind CSS**: A utility-first CSS framework allowing for highly tailored, breathtaking aesthetic layouts.
- **Framer Motion**: State-of-the-art animation library powering smooth, dynamic interface micro-interactions.
- **Recharts**: D3-based charting components delivering smooth, vector-based interactive business analytics.
- **Lucide React**: Clean, modern operational iconography.
- **Axios**: Promised-based HTTP client for secure API interactions.

### Backend Architecture
- **FastAPI**: An incredibly fast, modern Python web framework running on the asynchronous ASGI standard.
- **PostgreSQL**: An enterprise-grade, highly-relational SQL database designed for bullet-proof data integrity.
- **SQLAlchemy (Async)**: An advanced Python SQL toolkit treating database operations as fully asynchronous awaitables for maximum throughput.
- **Uvicorn**: A lightning-fast ASGI server implementation.
- **JWT (JSON Web Tokens)**: Stateless and highly secure credential authentication.
- **Pydantic**: Deep typing and data validation schemas guaranteeing API contract integrity.

---

## ✨ Amazing Features & Capabilities

### 🛍 Customer Experience
- **Dynamic Product Catalog**: Browse inventory via gorgeous grid layouts featuring real-time stock-checking and high-quality image associations.
- **Interactive Cart & Checkout**: Add, remove, and adjust items frictionlessly. Smoothly transitions customers into a multi-step checkout workflow with persistent cart caching.
- **User Dashboard**: Authenticated customers get specialized "My Orders" portals tracking historical invoices and profile updates.
- **Fluid & Responsive Design**: Custom breakpoints and typography variables mean the store looks impeccably stunning on mobile, tablet, and ultra-wide desktops alike.
- **Infinite Brand Marquee**: A dynamic, CSS-variable-driven customer review showcase running seamlessly at native 60fps on the homepage.
- **Real-Time Configurable Theming**: Core brand colors (`forest`, `lime`, `earth`, etc.) act dynamically via pure CSS variables and fetch from external configurations instantly.

### 🛡 Admin Capabilities
- **Advanced Data Grid Analytics**: Visualizing total sales volume, deep product movement metrics, and financial ticket averages cleanly filtered via standard time-ranges (Last 7 Days, Month, YTD).
- **Interactive Chronological Charts**: Beautiful `Recharts` area graphs that dynamically trend "Revenue" and "Units Sold" over user-selected historical frames to map growth safely.
- **Full Inventory Control (CRUD)**: Create, Read, Update, and Delete physical products including their categorized metadata and variable stock integers instantly via forms mapped against the database.
- **Order Pipeline Management**: Oversee every invoice natively. Update shipment and delivery statuses through an intuitive interface.
- **Customer Database**: Granular views into the userbase to monitor growth and manage internal administrative elevation tracking.
- **On-Demand SEO Optimization**: A dynamic `sitemap.xml` asynchronous Python script generator guarantees that all active e-commerce pathways are perpetually optimized for web crawlers instantly. 

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL (Active service)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file based on configurations
# Run the application:
uvicorn server:app --host 0.0.0.0 --port 8010 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the React hot-server:
npm start
```

### 3. SEO Sitemap Generation
*(When new products are added, regenerate the routing map instantly)*
```bash
cd backend
source venv/bin/activate
python generate_sitemap.py
```

---

*Designed and engineered with passion.* By bringing together Python's robust logic and React's gorgeous component structure, Samruddhi Organics provides a powerful operational baseline capable of extraordinary scaling.
