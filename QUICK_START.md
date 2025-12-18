# Quick Start Guide

## What's Been Implemented

✅ **Separate Admin & User Login**
- Admin redirects to `/admin` dashboard
- Users redirect to `/shop` page
- Registration page at `/register`

✅ **Product Discounts**
- Admin can set 0-100% discount on products
- Discounts shown with strikethrough original price
- Cart uses discounted prices

✅ **Product Likes/Favorites**
- Users can like products (heart icon)
- Requires login
- Like count tracked per product

✅ **Admin Dashboard**
- Add/edit/delete products with discounts
- Monitor orders, update status
- Manage classes & workshops
- View messages & stats

✅ **User Features**
- Register & login
- Browse products with filters
- Add to cart
- Like products
- Place orders

## Database Schema Changes Made

1. **Added to `products` table**:
   - `discountPercent` (integer, 0-100)

2. **New `product_likes` table**:
   - Links users to their favorite products

3. **New `users` table fields**:
   - `isAdmin` (boolean) for role management

## API Endpoints Added

```
POST   /api/auth/register              - User registration
GET    /api/products/:id/likes         - Get like status & count
POST   /api/products/:id/like          - Like product
DELETE /api/products/:id/like          - Unlike product
```

## To Run the Project

**If you have PostgreSQL set up:**

```bash
# 1. Update .env with your database credentials
DATABASE_URL=postgresql://user:pass@localhost:5432/artecommerce

# 2. Install dependencies
npm install

# 3. Push schema to database
npm run db:push

# 4. Seed database (creates admin + sample data)
npx tsx server/seed.ts

# 5. Start server
npm run dev
```

**Default Admin Login:**
- Username: `admin`
- Password: `admin123`

## File Changes Summary

### Backend:
- `shared/schema.ts` - Added discountPercent, productLikes table
- `server/routes.ts` - Added register & like endpoints
- `server/storage.ts` - Added like methods
- `server/seed.ts` - Added admin user creation

### Frontend:
- `pages/register.tsx` - NEW user registration page
- `pages/login.tsx` - Updated for role-based redirect
- `pages/shop.tsx` - Added like button & discount display
- `pages/admin.tsx` - Added discount field to product form
- `components/navigation.tsx` - Added login/logout UI
- `App.tsx` - Added register route

## Testing the Features

1. **Admin Flow**:
   - Login at `/login` with admin/admin123
   - Go to Products tab
   - Add product with discount
   - See discount badge on product

2. **User Flow**:
   - Register at `/register`
   - Browse `/shop`
   - Click product to see details
   - Click heart to like (must be logged in)
   - Add to cart with discounted price

3. **Discount Display**:
   - Products with discount show:
     - Discounted price (large)
     - Original price (strikethrough)
     - Discount badge (e.g., "20% OFF")

## Notes

- Cart stored in localStorage
- Likes require authentication
- Admin role set via `isAdmin` field
- Discounts applied at cart addition
