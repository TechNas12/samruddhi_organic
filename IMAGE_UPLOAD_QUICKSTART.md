# 🎯 Quick Start: Upload Product Images

## For Admins

### Step-by-Step Image Upload

1. **Login to Admin**
   - Go to: https://organics-hub-1.preview.emergentagent.com/admin/login
   - Username: `admin` | Password: `admin123`

2. **Navigate to Products**
   - Click "Products" in top navigation
   - OR go directly to: `/admin/products`

3. **Add or Edit Product**
   - **New Product**: Click green "Add Product" button
   - **Existing Product**: Click blue pencil icon next to any product

4. **Upload Image** (Two Options)

   **Option A: Upload from Computer** ⭐ Recommended
   ```
   1. Look for "Product Image" section
   2. Click "Choose File" under "Option 1: Upload Image"
   3. Select image from your computer
   4. Wait for "Image uploaded successfully!" message
   5. Preview appears automatically
   ```

   **Option B: Use Image URL**
   ```
   1. Find "Option 2: Image URL"
   2. Paste full image URL
   3. Preview appears automatically
   ```

5. **Complete & Save**
   - Fill in product name, price, stock
   - Click "Create Product" or "Update Product"
   - Done! ✓

---

## Image Requirements

✅ **Formats**: JPG, PNG, WEBP, GIF  
✅ **Max Size**: 5MB  
✅ **Recommended**: 800x800px square images  
✅ **Background**: White or transparent

---

## Features

### ✨ What You Can Do

- **Upload**: Select image files directly from computer
- **Preview**: See image before saving
- **Replace**: Upload new image to replace old one
- **Remove**: Click X button to remove image
- **URL Option**: Paste image URLs as alternative
- **Multiple Formats**: Supports JPG, PNG, WEBP, GIF
- **Validation**: Automatic checks for size and format

### 🔒 Security

- Only admins can upload
- File type validation
- Size limit enforcement
- Unique filenames (no overwrites)
- Safe storage location

---

## Where Images Are Stored

- **Server Path**: `/app/backend/static/uploads/`
- **Public URL**: `https://your-domain.com/static/uploads/filename.jpg`
- **Naming**: UUID-based unique names (e.g., `a1b2c3d4.jpg`)

---

## Tips for Great Product Images

### DO ✅
- Use high-quality, clear images
- Consistent white/plain background
- Good lighting
- Square format (1:1 ratio)
- Show product clearly
- Compress before upload

### DON'T ❌
- Upload blurry images
- Use watermarked images
- Exceed 5MB file size
- Use copyrighted images
- Upload different styles/backgrounds

---

## Troubleshooting

### Upload Failed?
- Check file size (must be < 5MB)
- Verify file format (JPG/PNG/WEBP/GIF only)
- Try different browser
- Check internet connection

### Image Not Showing?
- Wait for upload to complete
- Refresh the page
- Clear browser cache
- Check image URL in form field

### Preview Not Working?
- Verify image URL is correct
- Check browser console (F12) for errors
- Try uploading smaller image

---

## Quick Examples

### Good Image Examples
```
✅ product-tomato-seeds.jpg (500KB, 800x800px, white background)
✅ organic-fertilizer.png (1.2MB, 1000x1000px, transparent bg)
✅ farming-tool.webp (300KB, 600x600px, plain bg)
```

### Bad Image Examples
```
❌ huge-image.jpg (8MB - too large!)
❌ document.pdf (wrong format)
❌ blurry-photo.jpg (poor quality)
❌ screenshot.bmp (unsupported format)
```

---

## API Reference (For Developers)

### Upload Endpoint
```javascript
POST /api/admin/upload-image
Headers: {
  Authorization: "Bearer {admin_token}",
  Content-Type: "multipart/form-data"
}
Body: FormData with 'file' field

Response: {
  image_url: "https://domain.com/static/uploads/uuid.jpg",
  filename: "uuid.jpg"
}
```

### Usage in Code
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await axios.post(
  `${API_URL}/api/admin/upload-image`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'multipart/form-data'
    }
  }
);

console.log(response.data.image_url); // Use this URL
```

---

## Support

Need help? Check:
- 📄 Full Guide: `/app/IMAGE_UPLOAD_GUIDE.md`
- 🔧 Admin Guide: `/app/ADMIN_ACCESS_GUIDE.md`
- 📖 Project README: `/app/README_PROJECT.md`

---

**Pro Tip**: Prepare all product images in advance with consistent styling (same size, background, lighting) for a professional-looking store! 🎨
