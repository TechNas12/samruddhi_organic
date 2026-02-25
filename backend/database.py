from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, Numeric, Boolean, DateTime, ForeignKey, func, Index
from datetime import datetime, timezone
from typing import List, Optional
from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres123@localhost:5432/samruddhi_organics').replace('postgresql://', 'postgresql+asyncpg://')

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class IndianState(Base):
    __tablename__ = "indian_states"

    code: Mapped[str] = mapped_column(String(4), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False, default="state")  # state or ut
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    cities: Mapped[List["IndianCity"]] = relationship(
        "IndianCity", back_populates="state", cascade="all, delete-orphan"
    )


class IndianCity(Base):
    __tablename__ = "indian_cities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    state_code: Mapped[str] = mapped_column(
        String(4), ForeignKey("indian_states.code"), nullable=False, index=True
    )
    district: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    pin_prefix: Mapped[Optional[str]] = mapped_column(String(6), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    state: Mapped["IndianState"] = relationship("IndianState", back_populates="cities")


Index("ix_indian_cities_state_name", IndianCity.state_code, IndianCity.name)


class User(Base):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200), unique=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    orders: Mapped[List['Order']] = relationship('Order', back_populates='user')

class Category(Base):
    __tablename__ = 'categories'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    products: Mapped[List['Product']] = relationship('Product', back_populates='category')

class Product(Base):
    __tablename__ = 'products'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('categories.id'), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    category: Mapped[Optional['Category']] = relationship('Category', back_populates='products')
    order_items: Mapped[List['OrderItem']] = relationship('OrderItem', back_populates='product')

class Order(Base):
    __tablename__ = 'orders'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_number: Mapped[str] = mapped_column(String(50), unique=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    customer_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(20))
    address: Mapped[str] = mapped_column(Text)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(String(50), default='pending')
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user: Mapped['User'] = relationship('User', back_populates='orders')
    order_items: Mapped[List['OrderItem']] = relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')

class OrderItem(Base):
    __tablename__ = 'order_items'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey('orders.id'))
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey('products.id'))
    product_name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    
    order: Mapped['Order'] = relationship('Order', back_populates='order_items')
    product: Mapped['Product'] = relationship('Product', back_populates='order_items')

class Review(Base):
    __tablename__ = 'reviews'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('products.id', ondelete='CASCADE'), nullable=True)
    customer_name: Mapped[str] = mapped_column(String(200))
    rating: Mapped[float] = mapped_column(Numeric(3, 1))
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class AdminUser(Base):
    __tablename__ = 'admin_users'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True)
    email: Mapped[str] = mapped_column(String(200), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
