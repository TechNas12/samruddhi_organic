from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import select, update, delete, desc, func
from sqlalchemy.orm import selectinload
import os
import uuid
from dotenv import load_dotenv
from pathlib import Path
import shutil

from database import init_db, get_db, User, Product, Category, Order, OrderItem, Review, AdminUser
from auth import hash_password, verify_password, create_access_token, get_current_user, get_current_admin
from email_service import send_order_confirmation_email

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix='/api')

# Mount static files for serving uploaded images
app.mount("/static", StaticFiles(directory=str(ROOT_DIR / "static")), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=['*'],
    allow_headers=['*'],
)

# Pydantic Models
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    price: float
    stock: int = 0
    image_url: Optional[str] = None
    is_featured: bool = False

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category_id: Optional[int]
    category_name: Optional[str] = None
    price: float
    stock: int
    image_url: Optional[str]
    is_featured: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    customer_name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    notes: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    quantity: int
    price: float
    subtotal: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    total_amount: float
    status: str
    notes: Optional[str]
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    product_id: Optional[int] = None
    customer_name: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: Optional[int]
    customer_name: str
    rating: int
    comment: Optional[str]
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminStats(BaseModel):
    total_products: int
    low_stock_products: int
    total_orders: int
    pending_orders: int
    total_users: int

# User Auth Endpoints
@api_router.post('/auth/signup')
async def signup(user_data: UserSignup, db = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail='Email already registered')
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    token = create_access_token({'user_id': new_user.id, 'email': new_user.email}, role='user')
    return {'token': token, 'user': {'id': new_user.id, 'name': new_user.name, 'email': new_user.email}}

@api_router.post('/auth/login')
async def login(credentials: UserLogin, db = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail='Account is deactivated')
    
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    
    token = create_access_token({'user_id': user.id, 'email': user.email}, role='user')
    return {'token': token, 'user': {'id': user.id, 'name': user.name, 'email': user.email}}

@api_router.get('/auth/me', response_model=UserProfile)
async def get_profile(current_user = Depends(get_current_user), db = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user['user_id']))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user

@api_router.put('/auth/profile', response_model=UserProfile)
async def update_profile(profile_data: UserProfileUpdate, current_user = Depends(get_current_user), db = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user['user_id']))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    if profile_data.name is not None:
        user.name = profile_data.name
    if profile_data.phone is not None:
        user.phone = profile_data.phone
    if profile_data.address is not None:
        user.address = profile_data.address
    if profile_data.city is not None:
        user.city = profile_data.city
    if profile_data.state is not None:
        user.state = profile_data.state
    if profile_data.pincode is not None:
        user.pincode = profile_data.pincode
    
    await db.commit()
    await db.refresh(user)
    return user

# Product Endpoints
@api_router.get('/products', response_model=List[ProductResponse])
async def get_products(category_id: Optional[int] = None, featured: Optional[bool] = None, db = Depends(get_db)):
    query = select(Product).options(selectinload(Product.category))
    if category_id:
        query = query.where(Product.category_id == category_id)
    if featured:
        query = query.where(Product.is_featured == True)
    query = query.order_by(desc(Product.created_at))
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    products_list = []
    for product in products:
        product_dict = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'category_id': product.category_id,
            'category_name': product.category.name if product.category else None,
            'price': float(product.price),
            'stock': product.stock,
            'image_url': product.image_url,
            'is_featured': product.is_featured,
            'created_at': product.created_at
        }
        products_list.append(product_dict)
    
    return products_list

@api_router.get('/products/{product_id}', response_model=ProductResponse)
async def get_product(product_id: int, db = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.category)).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    
    return {
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'category_id': product.category_id,
        'category_name': product.category.name if product.category else None,
        'price': float(product.price),
        'stock': product.stock,
        'image_url': product.image_url,
        'is_featured': product.is_featured,
        'created_at': product.created_at
    }

# Category Endpoints
@api_router.get('/categories', response_model=List[CategoryResponse])
async def get_categories(db = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    return categories

# Order Endpoints
@api_router.post('/orders', response_model=OrderResponse)
async def create_order(order_data: OrderCreate, current_user = Depends(get_current_user), db = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == current_user['user_id']))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    total_amount = 0
    order_items_data = []
    
    for item in order_data.items:
        result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail=f'Product {item.product_id} not found')
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f'Insufficient stock for {product.name}')
        
        subtotal = float(product.price) * item.quantity
        total_amount += subtotal
        order_items_data.append({
            'product_id': product.id,
            'product_name': product.name,
            'quantity': item.quantity,
            'price': float(product.price),
            'subtotal': subtotal
        })
        
        product.stock -= item.quantity
    
    order_number = f'ORD-{uuid.uuid4().hex[:8].upper()}'
    new_order = Order(
        order_number=order_number,
        user_id=user.id,
        customer_name=order_data.customer_name,
        email=user.email,
        phone=order_data.phone,
        address=order_data.address,
        city=order_data.city,
        state=order_data.state,
        pincode=order_data.pincode,
        total_amount=total_amount,
        notes=order_data.notes
    )
    db.add(new_order)
    await db.flush()
    
    for item_data in order_items_data:
        order_item = OrderItem(order_id=new_order.id, **item_data)
        db.add(order_item)
    
    await db.commit()
    await db.refresh(new_order, ['order_items'])
    
    email_data = {
        'order_number': new_order.order_number,
        'customer_name': new_order.customer_name,
        'email': new_order.email,
        'phone': new_order.phone,
        'address': new_order.address,
        'city': new_order.city,
        'state': new_order.state,
        'pincode': new_order.pincode,
        'total_amount': float(new_order.total_amount),
        'status': new_order.status,
        'created_at': new_order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'items': order_items_data
    }
    await send_order_confirmation_email(email_data)
    
    return {
        'id': new_order.id,
        'order_number': new_order.order_number,
        'customer_name': new_order.customer_name,
        'email': new_order.email,
        'phone': new_order.phone,
        'address': new_order.address,
        'city': new_order.city,
        'state': new_order.state,
        'pincode': new_order.pincode,
        'total_amount': float(new_order.total_amount),
        'status': new_order.status,
        'notes': new_order.notes,
        'created_at': new_order.created_at,
        'items': [{'id': item.id, 'product_id': item.product_id, 'product_name': item.product_name, 
                   'quantity': item.quantity, 'price': float(item.price), 'subtotal': float(item.subtotal)} 
                  for item in new_order.order_items]
    }

@api_router.get('/orders/my-orders', response_model=List[OrderResponse])
async def get_my_orders(current_user = Depends(get_current_user), db = Depends(get_db)):
    result = await db.execute(
        select(Order).options(selectinload(Order.order_items))
        .where(Order.user_id == current_user['user_id'])
        .order_by(desc(Order.created_at))
    )
    orders = result.scalars().all()
    
    return [{
        'id': order.id,
        'order_number': order.order_number,
        'customer_name': order.customer_name,
        'email': order.email,
        'phone': order.phone,
        'address': order.address,
        'city': order.city,
        'state': order.state,
        'pincode': order.pincode,
        'total_amount': float(order.total_amount),
        'status': order.status,
        'notes': order.notes,
        'created_at': order.created_at,
        'items': [{'id': item.id, 'product_id': item.product_id, 'product_name': item.product_name,
                   'quantity': item.quantity, 'price': float(item.price), 'subtotal': float(item.subtotal)}
                  for item in order.order_items]
    } for order in orders]

# Review Endpoints
@api_router.get('/reviews', response_model=List[ReviewResponse])
async def get_reviews(product_id: Optional[int] = None, db = Depends(get_db)):
    query = select(Review).where(Review.is_approved == True)
    if product_id:
        query = query.where(Review.product_id == product_id)
    query = query.order_by(desc(Review.created_at))
    
    result = await db.execute(query)
    reviews = result.scalars().all()
    return reviews

@api_router.post('/reviews', response_model=ReviewResponse)
async def create_review(review_data: ReviewCreate, db = Depends(get_db)):
    new_review = Review(**review_data.model_dump())
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    return new_review

# Admin Auth
@api_router.post('/admin/login')
async def admin_login(credentials: AdminLogin, db = Depends(get_db)):
    result = await db.execute(select(AdminUser).where(AdminUser.username == credentials.username))
    admin = result.scalar_one_or_none()
    
    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    token = create_access_token({'admin_id': admin.id, 'username': admin.username}, role='admin')
    return {'token': token, 'admin': {'id': admin.id, 'username': admin.username}}

# Admin Product Management
@api_router.post('/admin/products', response_model=ProductResponse)
async def admin_create_product(product_data: ProductCreate, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    new_product = Product(**product_data.model_dump())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product, ['category'])
    
    return {
        'id': new_product.id,
        'name': new_product.name,
        'description': new_product.description,
        'category_id': new_product.category_id,
        'category_name': new_product.category.name if new_product.category else None,
        'price': float(new_product.price),
        'stock': new_product.stock,
        'image_url': new_product.image_url,
        'is_featured': new_product.is_featured,
        'created_at': new_product.created_at
    }

@api_router.put('/admin/products/{product_id}', response_model=ProductResponse)
async def admin_update_product(product_id: int, product_data: ProductCreate, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    
    for key, value in product_data.model_dump().items():
        setattr(product, key, value)
    
    await db.commit()
    await db.refresh(product, ['category'])
    
    return {
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'category_id': product.category_id,
        'category_name': product.category.name if product.category else None,
        'price': float(product.price),
        'stock': product.stock,
        'image_url': product.image_url,
        'is_featured': product.is_featured,
        'created_at': product.created_at
    }

@api_router.delete('/admin/products/{product_id}')
async def admin_delete_product(product_id: int, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    
    await db.delete(product)
    await db.commit()
    return {'message': 'Product deleted successfully'}

# Admin Category Management
@api_router.post('/admin/categories', response_model=CategoryResponse)
async def admin_create_category(category_data: CategoryCreate, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    new_category = Category(**category_data.model_dump())
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category

# Admin Order Management
@api_router.get('/admin/orders', response_model=List[OrderResponse])
async def admin_get_orders(status_filter: Optional[str] = None, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    query = select(Order).options(selectinload(Order.order_items))
    if status_filter:
        query = query.where(Order.status == status_filter)
    query = query.order_by(desc(Order.created_at))
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return [{
        'id': order.id,
        'order_number': order.order_number,
        'customer_name': order.customer_name,
        'email': order.email,
        'phone': order.phone,
        'address': order.address,
        'city': order.city,
        'state': order.state,
        'pincode': order.pincode,
        'total_amount': float(order.total_amount),
        'status': order.status,
        'notes': order.notes,
        'created_at': order.created_at,
        'items': [{'id': item.id, 'product_id': item.product_id, 'product_name': item.product_name,
                   'quantity': item.quantity, 'price': float(item.price), 'subtotal': float(item.subtotal)}
                  for item in order.order_items]
    } for order in orders]

@api_router.patch('/admin/orders/{order_id}/status')
async def admin_update_order_status(order_id: int, status: str, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail='Order not found')
    
    order.status = status
    await db.commit()
    return {'message': 'Order status updated', 'order_number': order.order_number, 'status': status}

# Admin User Management
@api_router.get('/admin/users')
async def admin_get_users(current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(User).order_by(desc(User.created_at)))
    users = result.scalars().all()
    
    return [{
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'phone': user.phone,
        'is_active': user.is_active,
        'created_at': user.created_at,
        'last_login': user.last_login
    } for user in users]

@api_router.patch('/admin/users/{user_id}/status')
async def admin_update_user_status(user_id: int, is_active: bool, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    user.is_active = is_active
    await db.commit()
    return {'message': 'User status updated', 'user_id': user_id, 'is_active': is_active}

# Admin Stats
@api_router.get('/admin/stats', response_model=AdminStats)
async def admin_get_stats(current_admin = Depends(get_current_admin), db = Depends(get_db)):
    total_products = await db.scalar(select(func.count(Product.id)))
    low_stock_products = await db.scalar(select(func.count(Product.id)).where(Product.stock < 10))
    total_orders = await db.scalar(select(func.count(Order.id)))
    pending_orders = await db.scalar(select(func.count(Order.id)).where(Order.status == 'pending'))
    total_users = await db.scalar(select(func.count(User.id)))
    
    return {
        'total_products': total_products or 0,
        'low_stock_products': low_stock_products or 0,
        'total_orders': total_orders or 0,
        'pending_orders': pending_orders or 0,
        'total_users': total_users or 0
    }

# Admin Review Management
@api_router.get('/admin/reviews', response_model=List[ReviewResponse])
async def admin_get_reviews(current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Review).order_by(desc(Review.created_at)))
    reviews = result.scalars().all()
    return reviews

@api_router.patch('/admin/reviews/{review_id}/approve')
async def admin_approve_review(review_id: int, is_approved: bool, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail='Review not found')
    
    review.is_approved = is_approved
    await db.commit()
    return {'message': 'Review approval status updated'}

app.include_router(api_router)

@app.on_event('startup')
async def startup():
    await init_db()
    
    from database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(AdminUser).where(AdminUser.username == 'admin'))
        admin = result.scalar_one_or_none()
        if not admin:
            default_admin = AdminUser(
                username='admin',
                email='admin@samruddhi.com',
                password_hash=hash_password('admin123')
            )
            db.add(default_admin)
            await db.commit()
            print('Default admin created: username=admin, password=admin123')

@app.get('/')
async def root():
    return {'message': 'Samruddhi Organics API'}
