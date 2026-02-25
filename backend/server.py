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
from fastapi import Request, Response

from database import (
    init_db,
    get_db,
    User,
    Product,
    Category,
    Order,
    OrderItem,
    Review,
    AdminUser,
    IndianState,
    IndianCity,
)
from auth import hash_password, verify_password, create_access_token, get_current_user, get_current_admin
from email_service import send_order_confirmation_email

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi.responses import JSONResponse

from locations_seed import seed_indian_states, seed_indian_cities


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
secure_cookie = ENVIRONMENT == "production"

app = FastAPI()
api_router = APIRouter(prefix='/api')
limiter = Limiter(key_func=get_remote_address)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


# Mount static files for serving uploaded images
app.mount("/static", StaticFiles(directory=str(ROOT_DIR / "static")), name="static")

raw_cors_origins = os.environ.get("CORS_ORIGINS")
if ENVIRONMENT == "production":
    if not raw_cors_origins or raw_cors_origins.strip() in {"", "*"}:
        raise RuntimeError(
            "CORS_ORIGINS must be set to a comma-separated list of allowed origins in production"
        )
    allowed_origins = [origin.strip() for origin in raw_cors_origins.split(",") if origin.strip()]
else:
    # In non-production, allow configured origins or fallback to wildcard
    if raw_cors_origins:
        allowed_origins = [origin.strip() for origin in raw_cors_origins.split(",") if origin.strip()]
    else:
        allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Pydantic Models
class UserSignup(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: Optional[str] = Field(default=None, min_length=6, max_length=20)

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
    email: Optional[EmailStr] = None
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
    customer_name: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=6, max_length=20)
    address: str = Field(min_length=1, max_length=500)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    pincode: str = Field(min_length=3, max_length=20)
    notes: Optional[str] = Field(default=None, max_length=1000)

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
    rating: float = Field(ge=0.5, le=5.0)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: Optional[int]
    customer_name: str
    rating: float
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

class ChartDataPoint(BaseModel):
    date: str
    sales: float
    products: int

class AdminAnalyticsStats(BaseModel):
    total_sales: float
    total_products_sold: int
    total_orders: int
    mean_ticket_price: float
    avg_sales_per_month: float
    avg_orders_per_month: float
    sales_growth_rate: float
    time_range: str
    active_months_calculated: float
    chart_data: List[ChartDataPoint]


# Location Models
class StateResponse(BaseModel):
    code: str
    name: str
    type: str

    class Config:
        from_attributes = True


class CityResponse(BaseModel):
    id: int
    name: str
    state_code: str

    class Config:
        from_attributes = True


# Location Endpoints
@api_router.get("/locations/states", response_model=List[StateResponse])
async def list_states(db = Depends(get_db)):
    result = await db.execute(select(IndianState).order_by(IndianState.name))
    states = result.scalars().all()
    return states


@api_router.get("/locations/cities", response_model=List[CityResponse])
@limiter.limit("60/minute")
async def search_cities(
    request: Request,
    state_code: str,
    q: str = "",
    limit: int = 20,
    db = Depends(get_db),
):
    state_result = await db.execute(select(IndianState).where(IndianState.code == state_code))
    state = state_result.scalar_one_or_none()
    if not state:
        raise HTTPException(status_code=400, detail="Invalid state code")

    query = select(IndianCity).where(IndianCity.state_code == state_code)
    if q:
        query = query.where(func.lower(IndianCity.name).like(f"%{q.lower()}%"))
    limit = min(max(limit, 1), 50)
    query = query.order_by(IndianCity.name).limit(limit)

    result = await db.execute(query)
    cities = result.scalars().all()
    return cities


# Helper functions
async def get_state_by_name(db, state_name: str) -> Optional[IndianState]:
    result = await db.execute(
        select(IndianState).where(func.lower(IndianState.name) == state_name.lower())
    )
    return result.scalar_one_or_none()


async def validate_state_and_city(
    db, state_name: Optional[str], city_name: Optional[str]
) -> None:
    """Validate that state and city are consistent with reference data."""
    if not state_name and not city_name:
        return

    if not state_name:
        raise HTTPException(status_code=400, detail="State is required when city is provided")

    state = await get_state_by_name(db, state_name)
    if not state:
        raise HTTPException(status_code=400, detail="Invalid state")

    if not city_name:
        return

    # If we have no city data for this state yet, allow any city string.
    city_count_result = await db.execute(
        select(func.count(IndianCity.id)).where(IndianCity.state_code == state.code)
    )
    city_count = city_count_result.scalar_one() or 0
    if city_count == 0:
        return

    city_query = await db.execute(
        select(IndianCity).where(
            IndianCity.state_code == state.code,
            func.lower(IndianCity.name) == city_name.lower(),
        )
    )
    city = city_query.scalar_one_or_none()
    if not city:
        raise HTTPException(
            status_code=400,
            detail="Invalid city for selected state",
        )


# User Auth Endpoints
@api_router.post('/auth/signup')
@limiter.limit("5/minute")
async def signup(
    request: Request,
    user_data: UserSignup,
    response: Response,
    db = Depends(get_db)
    ):
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

    token = create_access_token(
        {'user_id': new_user.id, 'email': new_user.email},
        role='user'
    )

    response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=secure_cookie,
    samesite="lax",
    max_age=60 * 60 * 24 * 7
)

    return {
        "message": "Signup successful",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


@api_router.post('/auth/login')
@limiter.limit("5/minute")
async def login(
    request: Request,
    credentials: UserLogin,
    response: Response,
    db = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail='Account is deactivated')
    
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    token = create_access_token(
        {'user_id': user.id, 'email': user.email},
        role='user'
    )

    response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=secure_cookie,
    samesite="lax",
    max_age=60 * 60 * 24 * 7
)

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=secure_cookie,
        samesite="lax"
    )

    return {"message": "Logged out successfully"}



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
    if profile_data.email is not None and profile_data.email != user.email:
        # Ensure new email is not already taken by another user
        existing = await db.execute(select(User).where(User.email == profile_data.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail='Email already registered')
        user.email = profile_data.email
    if profile_data.phone is not None:
        user.phone = profile_data.phone
    if profile_data.address is not None:
        user.address = profile_data.address
    if profile_data.city is not None or profile_data.state is not None:
        await validate_state_and_city(db, profile_data.state or user.state, profile_data.city or user.city)
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
@limiter.limit("10/minute")
async def create_order(
    order_data: OrderCreate,
    request: Request,
    current_user = Depends(get_current_user),
    db = Depends(get_db),
):
    await validate_state_and_city(db, order_data.state, order_data.city)

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
@limiter.limit("10/minute")
async def create_review(
    review_data: ReviewCreate,
    request: Request,
    db = Depends(get_db),
):
    new_review = Review(**review_data.model_dump())
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    return new_review

@api_router.put('/admin/reviews/{review_id}', response_model=ReviewResponse)
async def admin_update_review(review_id: int, review_data: ReviewCreate, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail='Review not found')
    
    for key, value in review_data.model_dump().items():
        setattr(review, key, value)
    
    await db.commit()
    await db.refresh(review)
    return review

@api_router.delete('/admin/reviews/{review_id}')
async def admin_delete_review(review_id: int, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail='Review not found')
    
    await db.delete(review)
    await db.commit()
    return {"message": "Review deleted successfully"}

# Admin Auth
@api_router.post('/admin/login')
@limiter.limit("5/minute")
async def admin_login(
    request: Request,
    credentials: AdminLogin,
    response: Response,
    db = Depends(get_db)
):
    result = await db.execute(
        select(AdminUser).where(AdminUser.username == credentials.username)
    )
    admin = result.scalar_one_or_none()

    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')

    token = create_access_token(
        {'admin_id': admin.id, 'username': admin.username},
        role='admin'
    )

    # ✅ THIS IS THE IMPORTANT PART
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=secure_cookie,
        samesite="lax",
        max_age=60 * 60 * 24 * 7
    )

    return {
        "message": "Admin login successful",
        "admin": {
            "id": admin.id,
            "username": admin.username
        }
    }

@api_router.get('/admin/me')
async def admin_me(current_admin = Depends(get_current_admin)):
    """Get current admin user info"""
    return {
        "admin": {
            "id": current_admin.get("admin_id"),
            "username": current_admin.get("username")
        }
    }

# Admin Image Upload
@api_router.post('/admin/upload-image')
async def upload_image(file: UploadFile = File(...), current_admin = Depends(get_current_admin)):
    # Validate file type
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail='Invalid file type. Only images are allowed.')
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    upload_path = ROOT_DIR / "static" / "uploads" / unique_filename
    
    # Save file
    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to upload image: {str(e)}')
    
    # Return the path to access the image (frontend will prepend backend base URL)
    # This keeps the base URL single-sourced from the frontend .env
    image_path = f"/static/uploads/{unique_filename}"
    
    return {
        'image_path': image_path,
        'filename': unique_filename
    }

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

@api_router.put('/admin/categories/{category_id}', response_model=CategoryResponse)
async def admin_update_category(category_id: int, category_data: CategoryCreate, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail='Category not found')
    
    for key, value in category_data.model_dump().items():
        setattr(category, key, value)
    
    await db.commit()
    await db.refresh(category)
    return category

@api_router.delete('/admin/categories/{category_id}')
async def admin_delete_category(category_id: int, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail='Category not found')
    
    await db.delete(category)
    await db.commit()
    return {'message': 'Category deleted successfully'}

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

@api_router.get('/admin/analytics', response_model=AdminAnalyticsStats)
async def admin_get_analytics(
    range: str = '30d', 
    current_admin = Depends(get_current_admin), 
    db = Depends(get_db)
):
    from datetime import datetime, timedelta, timezone
    
    now = datetime.now(timezone.utc)
    
    # Calculate start date based on range using standard timedelta
    if range == '7d':
        start_date = now - timedelta(days=7)
    elif range == '30d':
        start_date = now - timedelta(days=30)
    elif range == '1y':
        start_date = now - timedelta(days=365)
    elif range == 'all':
        # Default arbitrarily to 10 years ago to easily grab everything
        start_date = now - timedelta(days=365*10)
    else:
        # Default to 30 days if unknown
        start_date = now - timedelta(days=30)
        range = '30d'

    # 1. Total valid orders (exclude cancelled/failed depending on business logic, here we exclude 'cancelled')
    orders_query = select(Order).where(
        Order.created_at >= start_date,
        Order.created_at < now,
        Order.status != 'cancelled'
    )
    result = await db.execute(orders_query)
    valid_orders = result.scalars().all()
    
    total_orders = len(valid_orders)
    total_sales = float(sum(order.total_amount for order in valid_orders)) if valid_orders else 0.0
    
    # Calculate previous period for growth rate
    previous_start_date = start_date - (now - start_date)
    prev_orders_query = select(Order).where(
        Order.created_at >= previous_start_date,
        Order.created_at < start_date,
        Order.status != 'cancelled'
    )
    prev_result = await db.execute(prev_orders_query)
    prev_valid_orders = prev_result.scalars().all()
    prev_total_sales = float(sum(order.total_amount for order in prev_valid_orders)) if prev_valid_orders else 0.0
    
    if prev_total_sales > 0:
        sales_growth_rate = ((total_sales - prev_total_sales) / prev_total_sales) * 100.0
    elif total_sales > 0:
        sales_growth_rate = 100.0  # Infinite growth, capped at 100% for display simplicity
    else:
        sales_growth_rate = 0.0
        
    # 2. Total products sold (quantity in order_items for these valid orders)
    total_products_sold = 0
    if valid_orders:
        valid_order_ids = [order.id for order in valid_orders]
        items_query = select(func.sum(OrderItem.quantity)).where(
            OrderItem.order_id.in_(valid_order_ids)
        )
        total_products_sold = await db.scalar(items_query) or 0
        
    # Calculate averages
    mean_ticket_price = (total_sales / total_orders) if total_orders > 0 else 0.0
    
    # Calculate months factor for per_month averages
    days_in_range = (now - start_date).days
    
    # Cap minimum days to 1 to avoid ZeroDivisionError, but logically '7d' is 0.23 months.
    days_in_range = max(1, days_in_range) 
    months_factor = days_in_range / 30.44  # Average days in a month
    
    # If range is "all", it's better to calculate months spanning from their very first order or use days_in_range
    # Using days_in_range is mathematically consistent.
    
    avg_sales_per_month = total_sales / months_factor
    avg_orders_per_month = total_orders / months_factor

    # 3. Group by Date for Charting
    from collections import defaultdict
    chart_dict = defaultdict(lambda: {'sales': 0.0, 'products': 0})
    
    # Determine grouping format ('YYYY-MM-DD' for 7d/30d, 'YYYY-MM' for 1y/all)
    date_format = '%Y-%m-%d' if range in ['7d', '30d'] else '%Y-%m'

    # Group sales
    for order in valid_orders:
        date_str = order.created_at.strftime(date_format)
        chart_dict[date_str]['sales'] += float(order.total_amount)
        
    # Group products sold
    if valid_orders:
        valid_order_ids = [order.id for order in valid_orders]
        # We need the product quantities joined with the order date
        items_with_dates = await db.execute(
            select(OrderItem.quantity, Order.created_at)
            .join(Order, OrderItem.order_id == Order.id)
            .where(Order.id.in_(valid_order_ids))
        )
        for qty, created_at in items_with_dates:
            date_str = created_at.strftime(date_format)
            chart_dict[date_str]['products'] += qty
            
    # Format and sort chart data
    chart_data = [
        ChartDataPoint(
            date=period, 
            sales=round(data['sales'], 2), 
            products=data['products']
        ) 
        for period, data in sorted(chart_dict.items())
    ]

    return {
        'total_sales': round(total_sales, 2),
        'total_products_sold': total_products_sold,
        'total_orders': total_orders,
        'mean_ticket_price': round(mean_ticket_price, 2),
        'avg_sales_per_month': round(avg_sales_per_month, 2),
        'avg_orders_per_month': round(avg_orders_per_month, 2),
        'sales_growth_rate': round(sales_growth_rate, 2),
        'time_range': range,
        'active_months_calculated': round(months_factor, 2),
        'chart_data': chart_data
    }

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please slow down."},
    )


# Admin Review Management
@api_router.get('/admin/reviews', response_model=List[ReviewResponse])
async def admin_get_reviews(current_admin = Depends(get_current_admin), db = Depends(get_db)):
    result = await db.execute(select(Review).order_by(desc(Review.created_at)))
    reviews = result.scalars().all()
    return reviews

@api_router.post('/admin/reviews', response_model=ReviewResponse)
async def admin_create_review(review_data: ReviewCreate, current_admin = Depends(get_current_admin), db = Depends(get_db)):
    new_review = Review(**review_data.model_dump())
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    return new_review

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
    # Seed reference data for Indian states (idempotent)
    from database import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        await seed_indian_states(session)
        await seed_indian_cities(session)

@app.get('/')
async def root():
    return {'message': 'Samruddhi Organics API'}

@app.get('/health')
async def health(db = Depends(get_db)):
    try:
        # Simple DB check
        await db.execute(select(1))
    except Exception:
        raise HTTPException(status_code=503, detail='Database unavailable')
    return {'status': 'ok'}
