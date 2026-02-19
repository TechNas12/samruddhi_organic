import asyncio
import sys
sys.path.append('/app/backend')

from database import AsyncSessionLocal, Category, Product, Review
from sqlalchemy import select

async def populate_data():
    async with AsyncSessionLocal() as session:
        # Check if categories already exist
        result = await session.execute(select(Category))
        existing_categories = result.scalars().all()
        
        if len(existing_categories) > 0:
            print("Data already exists. Skipping...")
            return
        
        # Create Categories
        categories = [
            Category(
                name="Organic Seeds",
                description="Premium quality organic seeds for various crops",
                image_url="https://images.pexels.com/photos/5425794/pexels-photo-5425794.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            ),
            Category(
                name="Organic Fertilizers",
                description="100% natural fertilizers for healthy crop growth",
                image_url="https://images.pexels.com/photos/4506992/pexels-photo-4506992.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            ),
            Category(
                name="Bio-Pesticides",
                description="Chemical-free pest control solutions",
                image_url="https://images.pexels.com/photos/7299931/pexels-photo-7299931.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            ),
            Category(
                name="Farming Tools",
                description="Essential tools for organic farming",
                image_url="https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            )
        ]
        
        for cat in categories:
            session.add(cat)
        await session.commit()
        
        # Refresh to get IDs
        for cat in categories:
            await session.refresh(cat)
        
        print(f"Created {len(categories)} categories")
        
        # Create Products
        products = [
            # Seeds
            Product(
                name="Organic Tomato Seeds",
                description="High-yield organic tomato seeds suitable for all climates. Disease resistant variety.",
                category_id=categories[0].id,
                price=149.00,
                stock=500,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600"
            ),
            Product(
                name="Organic Wheat Seeds",
                description="Premium quality organic wheat seeds with excellent germination rate.",
                category_id=categories[0].id,
                price=899.00,
                stock=200,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600"
            ),
            Product(
                name="Organic Spinach Seeds",
                description="Fresh organic spinach seeds for year-round cultivation.",
                category_id=categories[0].id,
                price=99.00,
                stock=300,
                image_url="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600"
            ),
            Product(
                name="Organic Carrot Seeds",
                description="Orange carrots with sweet flavor. Organic certified seeds.",
                category_id=categories[0].id,
                price=129.00,
                stock=250,
                image_url="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600"
            ),
            
            # Fertilizers
            Product(
                name="Vermicompost - 10kg",
                description="Rich organic compost made from earthworm castings. Improves soil fertility.",
                category_id=categories[1].id,
                price=450.00,
                stock=150,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600"
            ),
            Product(
                name="Neem Cake Powder - 5kg",
                description="100% pure neem cake powder. Excellent organic fertilizer and pest repellent.",
                category_id=categories[1].id,
                price=350.00,
                stock=200,
                image_url="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600"
            ),
            Product(
                name="Bio NPK Fertilizer - 1kg",
                description="Organic NPK fertilizer for balanced nutrition. Suitable for all crops.",
                category_id=categories[1].id,
                price=299.00,
                stock=180,
                image_url="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600"
            ),
            
            # Bio-Pesticides
            Product(
                name="Neem Oil - 1 Liter",
                description="Cold-pressed neem oil. Natural pesticide and fungicide.",
                category_id=categories[2].id,
                price=499.00,
                stock=100,
                is_featured=True,
                image_url="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600"
            ),
            Product(
                name="Organic Pest Spray - 500ml",
                description="Ready-to-use organic pest control spray. Safe for plants and environment.",
                category_id=categories[2].id,
                price=249.00,
                stock=120,
                image_url="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600"
            ),
            
            # Tools
            Product(
                name="Garden Hand Trowel",
                description="Durable stainless steel hand trowel for planting and weeding.",
                category_id=categories[3].id,
                price=199.00,
                stock=80,
                image_url="https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600"
            ),
            Product(
                name="Pruning Shears",
                description="Professional grade pruning shears with comfortable grip.",
                category_id=categories[3].id,
                price=399.00,
                stock=60,
                image_url="https://images.unsplash.com/photo-1617575742108-5b1c6cf64a2f?w=600"
            ),
            Product(
                name="Watering Can - 10L",
                description="Large capacity watering can with long spout for easy watering.",
                category_id=categories[3].id,
                price=349.00,
                stock=5,  # Low stock item
                image_url="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=600"
            )
        ]
        
        for product in products:
            session.add(product)
        await session.commit()
        
        print(f"Created {len(products)} products")
        
        # Create Reviews
        reviews = [
            Review(
                product_id=None,
                customer_name="Ramesh Patil",
                rating=5,
                comment="Excellent quality products! My farm yield has increased significantly after using these organic supplies.",
                is_approved=True
            ),
            Review(
                product_id=None,
                customer_name="Sunita Deshmukh",
                rating=5,
                comment="Best organic farming store! Products are genuine and prices are reasonable. Highly recommended.",
                is_approved=True
            ),
            Review(
                product_id=None,
                customer_name="Vijay Kumar",
                rating=5,
                comment="Very satisfied with the quality. The vermicompost has worked wonders for my vegetable garden.",
                is_approved=True
            ),
            Review(
                product_id=None,
                customer_name="Priya Sharma",
                rating=4,
                comment="Good products and fast delivery. Would love to see more variety in seeds.",
                is_approved=True
            )
        ]
        
        for review in reviews:
            session.add(review)
        await session.commit()
        
        print(f"Created {len(reviews)} reviews")
        print("Sample data populated successfully!")

if __name__ == "__main__":
    asyncio.run(populate_data())
