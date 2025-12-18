# Project is Running! 🎉

## Server Status
✅ Server is running on: **http://localhost:5000**

## Access the Application

### For Users:
1. **Home Page**: http://localhost:5000
2. **Register**: http://localhost:5000/register
3. **Login**: http://localhost:5000/login
4. **Shop**: http://localhost:5000/shop

### For Admin:
1. **Login**: http://localhost:5000/login
   - Username: `admin`
   - Password: `admin123`
2. **Dashboard**: http://localhost:5000/admin

## Features Available

### Admin Features (after login as admin):
- ✅ Add products with discounts (0-100%)
- ✅ Edit/delete products
- ✅ View and manage orders
- ✅ Update order status
- ✅ Manage classes and workshops
- ✅ View contact messages
- ✅ Dashboard with statistics

### User Features (after registration):
- ✅ Browse products with category filters
- ✅ View product details
- ✅ Like/favorite products (heart icon)
- ✅ Add products to cart (with discounted prices)
- ✅ Place orders
- ✅ Register for classes
- ✅ Book workshops

### Guest Features (no login required):
- ✅ Browse products
- ✅ View product details
- ✅ Add to cart
- ✅ View gallery
- ✅ Contact form

## Testing the New Features

### 1. Test Product Discounts:
1. Login as admin
2. Go to Products tab
3. Click "Add Product"
4. Fill in details and set "Discount %" (e.g., 20)
5. Save product
6. Go to Shop page - see discount badge and strikethrough price

### 2. Test Product Likes:
1. Register a new user account
2. Go to Shop page
3. Click on a product
4. Click the heart icon to like
5. Heart fills red when liked

### 3. Test User vs Admin Login:
1. Login as admin → redirects to /admin
2. Logout
3. Login as regular user → redirects to /shop

## Database Note
⚠️ **Database not seeded yet**

To add sample data and admin user:
```bash
npm run seed
```

This will create:
- Admin user (admin/admin123)
- Sample products
- Sample classes
- Sample workshops
- Sample testimonials

## PostCSS Warning
The PostCSS warning you see is harmless and doesn't affect functionality. It's a known issue with some PostCSS plugins.

## Stop the Server
Press `Ctrl+C` in the terminal to stop the server.
