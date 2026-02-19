# Samruddhi Organics E-commerce Architecture

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router with Server Components)
- **Styling**: Tailwind CSS
- **State Management**: React Context API for cart
- **HTTP Client**: Fetch API / Axios
- **Port**: 3000

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Authentication**: JWT tokens (for admin)
- **Email**: Gmail SMTP with App Passwords
- **Port**: 8001

### Database
- **Type**: PostgreSQL
- **Port**: 5432
- **ORM**: SQLAlchemy with async support

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                                                              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐        │
│  │  Landing   │  │  Products   │  │    Admin     │        │
│  │    Page    │  │   Catalog   │  │   Portal     │        │
│  └────────────┘  └─────────────┘  └──────────────┘        │
│         │                │                 │                │
│         └────────────────┴─────────────────┘                │
│                          │                                   │
│                   Next.js App (Port 3000)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      API LAYER                               │
│                                                              │
│                   FastAPI Backend (Port 8001)               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐      │
│  │   Products   │  │    Orders    │  │    Admin    │      │
│  │     API      │  │     API      │  │     API     │      │
│  └──────────────┘  └──────────────┘  └─────────────┘      │
│         │                  │                                │
│         └──────────────────┴────────────┐                  │
│                                          │                  │
└──────────────────────────────────────────┼──────────────────┘
                                           │
                    ┌──────────────────────┼──────────────┐
                    │                      │              │
                    ▼                      ▼              ▼
         ┌─────────────────┐    ┌────────────────┐   ┌──────────┐
         │   PostgreSQL    │    │  Gmail SMTP    │   │  File    │
         │    Database     │    │  (App Pass)    │   │  Storage │
         │   (Port 5432)   │    │                │   │          │
         └─────────────────┘    └────────────────┘   └──────────┘
```

---

## Database Schema

### 1. Categories Table
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Orders Table
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    customer_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Order Items Table
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(200),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);
```

### 5. Reviews Table
```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    customer_name VARCHAR(200) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Users Table (Customer Accounts)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### 7. Admin Users Table
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Public Endpoints

#### Products
- `GET /api/products` - Get all products (with pagination, filters)
- `GET /api/products/{id}` - Get single product details
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/{category_id}` - Get products by category

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get single category

#### Reviews
- `GET /api/reviews` - Get all approved reviews
- `GET /api/reviews/product/{product_id}` - Get reviews for a product
- `POST /api/reviews` - Submit a review

#### Orders
- `POST /api/orders` - Create new order (checkout)
- `GET /api/orders/{order_number}` - Get order details (for confirmation)

### Admin Endpoints (Protected)

#### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout

#### Product Management
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `PATCH /api/admin/products/{id}/stock` - Update stock

#### Order Management
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/{id}` - Get order details
- `PATCH /api/admin/orders/{id}/status` - Update order status

#### Category Management
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category

#### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics
  - Total products, low stock items
  - Total orders, pending orders
  - Recent orders

#### Review Management
- `GET /api/admin/reviews` - Get all reviews (including unapproved)
- `PATCH /api/admin/reviews/{id}/approve` - Approve review

---

## Frontend Structure (Next.js App Router)

```
/app
├── layout.js                 # Root layout with navbar, footer
├── page.js                   # Landing page (hero, products, reviews)
├── globals.css               # Global styles
│
├── products/
│   ├── page.js              # Product catalog with filters
│   └── [id]/
│       └── page.js          # Product detail page
│
├── cart/
│   └── page.js              # Shopping cart
│
├── checkout/
│   └── page.js              # Checkout form
│
├── about/
│   └── page.js              # About us page
│
├── contact/
│   └── page.js              # Contact page
│
├── order-confirmation/
│   └── [orderNumber]/
│       └── page.js          # Order confirmation
│
└── admin/
    ├── layout.js            # Admin layout
    ├── login/
    │   └── page.js         # Admin login
    ├── dashboard/
    │   └── page.js         # Admin dashboard
    ├── products/
    │   ├── page.js         # Product list
    │   ├── new/
    │   │   └── page.js     # Add product
    │   └── [id]/
    │       └── page.js     # Edit product
    └── orders/
        ├── page.js         # Order list
        └── [id]/
            └── page.js     # Order details

/components
├── Navbar.js
├── Footer.js
├── ProductCard.js
├── CategoryFilter.js
├── ReviewCard.js
├── CartItem.js
└── admin/
    ├── Sidebar.js
    ├── StatsCard.js
    └── OrderTable.js

/lib
├── api.js                   # API client functions
├── cart-context.js          # Cart state management
└── auth.js                  # Admin auth utilities
```

---

## Key User Flows

### 1. Customer Purchase Flow
```
1. Land on homepage → View featured products & reviews
2. Browse products → Filter by category
3. Click product → View details, add to cart
4. View cart → Update quantities
5. Checkout → Fill form (name, email, phone, address)
6. Submit order → Order created in database
7. Email sent → Customer receives confirmation
8. Show confirmation page → Order number displayed
```

### 2. Admin Management Flow
```
1. Admin login → JWT token stored
2. Dashboard → View stats (products, orders, stock alerts)
3. Manage Products:
   - View all products
   - Add new product
   - Edit product details
   - Update stock
   - Delete product
4. Manage Orders:
   - View all orders
   - Filter by status (pending, processing, completed)
   - Update order status
   - View customer details
5. Approve Reviews
```

---

## Email System (Gmail SMTP)

### Configuration
- **Host**: smtp.gmail.com
- **Port**: 587 (TLS)
- **Authentication**: Gmail account + App Password

### Email Templates

#### Order Confirmation Email
```
To: Customer Email
Subject: Order Confirmation - {ORDER_NUMBER} | Samruddhi Organics

Dear {CUSTOMER_NAME},

Thank you for your order at Samruddhi Organics!

Order Number: {ORDER_NUMBER}
Order Date: {DATE}

Order Summary:
{PRODUCT_LIST}

Total Amount: ₹{TOTAL}

Delivery Address:
{ADDRESS}

We will contact you shortly to confirm your order.

Thank you for choosing organic!

Best regards,
Samruddhi Organics Team
```

---

## Security Considerations

1. **Admin Authentication**: JWT tokens with expiration
2. **Password Hashing**: bcrypt for admin passwords
3. **Input Validation**: Pydantic models in FastAPI
4. **SQL Injection**: Prevented by SQLAlchemy ORM
5. **CORS**: Configured to allow Next.js frontend only
6. **Environment Variables**: Sensitive data in .env files

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/samruddhi_organics
JWT_SECRET=your-secret-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

---

## Development Workflow

1. **Database Setup**: Create PostgreSQL database and tables
2. **Backend Development**: FastAPI with SQLAlchemy models
3. **Frontend Development**: Next.js pages and components
4. **Integration**: Connect frontend to backend APIs
5. **Email Testing**: Configure Gmail SMTP
6. **Testing**: Test all flows end-to-end
7. **Deployment**: Deploy to production

---

## Advantages of This Architecture

1. **SEO-Friendly**: Next.js SSR/SSG for better search rankings
2. **Fast Performance**: Server components and optimized images
3. **Scalable**: PostgreSQL handles growth better than MongoDB
4. **Type-Safe**: Pydantic models ensure data validation
5. **Maintainable**: Clear separation of concerns
6. **No Payment Complexity**: Simple order management without gateway integration

---

## Next Steps

1. Set up PostgreSQL database
2. Install required dependencies (Next.js, FastAPI libraries)
3. Create database models and migrations
4. Build backend API endpoints
5. Develop Next.js frontend pages
6. Integrate email functionality
7. Test complete user flows
8. Deploy application
