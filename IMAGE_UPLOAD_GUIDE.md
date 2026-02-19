# 📸 Product Image Upload Feature - Admin Guide

## Overview
Admins can now upload their own product images directly from the admin panel, instead of just using image URLs!

## How to Upload Product Images

### Method 1: Upload from Your Computer (Recommended)

1. **Go to Admin Products Page**
   - Login to admin panel
   - Navigate to Products section
   - Click "Add Product" or "Edit" an existing product

2. **Upload Image**
   - Look for the "Product Image" section in the form
   - Under "Option 1: Upload Image"
   - Click "Choose File" button
   - Select an image from your computer
   - Wait for upload to complete (you'll see "Uploading image..." message)
   - Preview of uploaded image appears automatically

3. **Save Product**
   - Fill in other product details
   - Click "Create Product" or "Update Product"
   - Your uploaded image is now associated with the product!

### Method 2: Use Image URL (Alternative)

If you have an image hosted elsewhere:
- Use "Option 2: Image URL"
- Paste the full URL (e.g., https://example.com/product.jpg)
- Preview appears automatically

## Image Requirements

### Supported Formats
- ✅ JPG / JPEG
- ✅ PNG
- ✅ WEBP
- ✅ GIF

### File Size Limit
- **Maximum**: 5MB per image
- Recommended: 500KB - 2MB for best performance

### Recommended Image Specifications
- **Dimensions**: 800x800px or 1000x1000px (square images look best)
- **Aspect Ratio**: 1:1 (square) or 4:3
- **Resolution**: 72-150 DPI
- **Background**: White or transparent background preferred

## Image Upload Flow

```
1. Admin selects image file
2. Frontend validates file (type & size)
3. Image uploads to backend
4. Backend saves to /app/backend/static/uploads/
5. Backend returns image URL
6. Image URL auto-fills in form
7. Preview shows uploaded image
8. Admin saves product
9. Image displays on customer-facing pages
```

## Where Are Images Stored?

### Backend Storage
- **Location**: `/app/backend/static/uploads/`
- **Naming**: Each image gets a unique UUID-based filename
- **Example**: `a1b2c3d4e5f6.jpg`

### Public Access
- Images are served via: `https://your-domain.com/static/uploads/filename.jpg`
- Accessible to all users (public)
- Cached by browsers for performance

## Tips for Best Results

### 1. Image Quality
- Use high-quality images (not blurry or pixelated)
- Ensure good lighting
- Remove any watermarks or text overlays
- Show product clearly against plain background

### 2. Consistency
- Use similar style for all product images
- Same background color/style
- Consistent image dimensions
- Uniform lighting and angle

### 3. Image Optimization
- Compress images before upload (use tools like TinyPNG)
- Use WEBP format for smaller file sizes
- Avoid uploading images larger than needed
- Crop unnecessary white space

### 4. Mobile Friendly
- Images automatically responsive
- Test how they look on mobile devices
- Ensure key product details are visible even when zoomed out

## Troubleshooting

### "Image size should be less than 5MB"
**Solution**: Compress your image before uploading
- Use online tools: TinyPNG, Squoosh, Compressor.io
- Or use image editing software to reduce quality/dimensions

### "Please upload a valid image file"
**Problem**: File format not supported
**Solution**: Convert your image to JPG, PNG, WEBP, or GIF

### Upload Keeps Failing
**Possible causes**:
1. Internet connection issue - try again
2. File corrupted - try different image
3. Browser issue - clear cache or try different browser
4. Server space full - contact administrator

### Image Not Showing After Upload
**Check**:
1. Did you click "Save Product" after uploading?
2. Refresh the products page
3. Check browser console for errors (F12)
4. Verify image URL in product details

### Preview Not Showing
- Wait a moment after upload completes
- Image might still be processing
- Try pasting URL manually in URL field
- Check if image actually uploaded (look at form field value)

## Managing Uploaded Images

### Viewing Uploaded Images
- All images stored in: `/app/backend/static/uploads/`
- Can be viewed directly via browser using the URL
- Listed in product details

### Replacing Product Image
1. Edit the product
2. Upload new image (old URL gets replaced)
3. Or paste new URL in URL field
4. Save product

### Deleting Product Images
- When product is deleted, image URL is removed
- Actual file remains on server
- To clean up old images: manually delete from uploads folder

## Advanced: Direct File Management

### Via Command Line (SSH Access)
```bash
# View all uploaded images
ls -lh /app/backend/static/uploads/

# Check folder size
du -sh /app/backend/static/uploads/

# Delete specific image
rm /app/backend/static/uploads/filename.jpg

# Clean up old unused images (be careful!)
# First backup, then delete
```

### Via Admin Panel (Future Enhancement)
- Image gallery view
- Bulk delete unused images
- Image usage statistics
- Image optimization tools

## Security Notes

### Upload Security
- ✅ File type validation (only images allowed)
- ✅ File size limit (5MB max)
- ✅ Admin authentication required
- ✅ Unique filenames prevent overwrites
- ✅ Files stored outside web root (served via FastAPI)

### Best Practices
- Don't upload sensitive/copyrighted images
- Use your own product photos
- Verify image content before upload
- Regular backup of uploads folder

## API Endpoint Details

### Upload Image Endpoint
```
POST /api/admin/upload-image
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Body: {
  file: [image file]
}

Response: {
  "image_url": "https://domain.com/static/uploads/abc123.jpg",
  "filename": "abc123.jpg"
}
```

## Examples

### Good Image Examples
✅ White background, product centered
✅ Good lighting, clear details
✅ Square format (1:1 aspect ratio)
✅ No text overlays or watermarks
✅ High resolution, not blurry

### Poor Image Examples
❌ Cluttered background
❌ Poor lighting, shadows
❌ Image too small or pixelated
❌ Product cut off at edges
❌ Heavy watermarks covering product

## Quick Reference

| Feature | Details |
|---------|---------|
| Max File Size | 5MB |
| Formats | JPG, PNG, WEBP, GIF |
| Storage Location | /app/backend/static/uploads/ |
| Access | Admin only can upload |
| Viewing | Public (all users can see) |
| Naming | UUID-based unique names |
| URL Format | /static/uploads/filename.ext |

---

## Need Help?

**Feature not working?**
1. Check if you're logged in as admin
2. Verify file meets requirements (size, format)
3. Try different browser
4. Clear browser cache
5. Check backend logs for errors

**Want to add features?**
- Bulk upload multiple images
- Image cropping/editing tool
- Automatic image optimization
- Image gallery management
- Multiple images per product

---

**Pro Tip**: Upload all product images with consistent styling for a professional look across your entire store! 🎨
