import os
import sys
import asyncio
from datetime import datetime
import xml.etree.ElementTree as ET
from xml.dom import minidom
from sqlalchemy.future import select

# Add current dir to path to import database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import AsyncSessionLocal
from database import Product, Category

async def generate_sitemap_async():
    # Setup base URL
    base_url = os.environ.get('FRONTEND_URL', 'https://www.samruddhiorganics.shop')
    if 'localhost' in base_url or '127.0.0.1' in base_url:
        print("Warning: FRONTEND_URL is localhost. Using production domain placeholder for sitemap.")
        base_url = 'https://www.samruddhiorganics.shop'
    
    # Create the root element
    urlset = ET.Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    
    # List of static routes in the React application
    static_routes = [
        '/',
        '/products',
        '/about',
        '/contact',
        '/signup',
        '/login',
    ]
    
    # Add static routes
    current_time = datetime.now().strftime('%Y-%m-%d')
    for route in static_routes:
        url = ET.SubElement(urlset, 'url')
        loc = ET.SubElement(url, 'loc')
        loc.text = f"{base_url}{route}"
        lastmod = ET.SubElement(url, 'lastmod')
        lastmod.text = current_time
        priority = ET.SubElement(url, 'priority')
        priority.text = '1.0' if route == '/' else '0.8'
        changefreq = ET.SubElement(url, 'changefreq')
        changefreq.text = 'weekly'

    # Add dynamic products
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Product))
            products = result.scalars().all()
            for product in products:
                url = ET.SubElement(urlset, 'url')
                loc = ET.SubElement(url, 'loc')
                loc.text = f"{base_url}/products/{product.id}"
                lastmod = ET.SubElement(url, 'lastmod')
                # Use updated_at if available, else current date
                lastmod.text = product.updated_at.strftime('%Y-%m-%d') if product.updated_at else current_time
                priority = ET.SubElement(url, 'priority')
                priority.text = '0.9'
                changefreq = ET.SubElement(url, 'changefreq')
                changefreq.text = 'weekly'
                
            print(f"Added {len(products)} active products to sitemap.")
                
        except Exception as e:
            print(f"Error fetching products: {e}")

    # Pretty print XML
    xmlstr = minidom.parseString(ET.tostring(urlset)).toprettyxml(indent="  ")
    
    # Output file path
    frontend_public_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'public')
    output_path = os.path.abspath(os.path.join(frontend_public_dir, 'sitemap.xml'))
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        # Remove empty lines minidom might add
        f.write('\n'.join([line for line in xmlstr.split('\n') if line.strip()]))
        
    print(f"Successfully generated sitemap at: {output_path}")

def generate_sitemap():
    asyncio.run(generate_sitemap_async())

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    generate_sitemap()
