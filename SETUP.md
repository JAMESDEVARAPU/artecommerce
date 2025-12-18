# Setup Instructions

## Prerequisites
- Node.js installed
- PostgreSQL installed and running

## Database Setup

### Option 1: Local PostgreSQL
1. Install PostgreSQL if not already installed
2. Create a database:
   ```sql
   CREATE DATABASE artecommerce;
   ```
3. Update `.env` file with your PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/artecommerce
   ```

### Option 2: Use Replit Database
If running on Replit, the DATABASE_URL is automatically provided.

## Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Push database schema**:
   ```bash
   npm run db:push
   ```

3. **Seed database** (creates admin user and sample data):
   ```bash
   npx tsx server/seed.ts
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

## Features Available

### Admin (login at `/login` with admin credentials)
- Add/edit/delete products
- Set product discounts (0-100%)
- Monitor and manage orders
- Manage classes and workshops
- View contact messages
- Dashboard with stats

### Users (register at `/register`)
- Browse products with discounts
- Like/favorite products
- Add items to cart
- Place orders
- Register for classes
- Book workshops

## Environment Variables

Create a `.env` file with:
```
DATABASE_URL=postgresql://username:password@localhost:5432/artecommerce
SESSION_SECRET=your-secret-key-here
NODE_ENV=development
PORT=5000
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL credentials
- Verify database exists

### Port Already in Use
- Change PORT in `.env` file
- Or stop the process using port 5000

### Missing Dependencies
```bash
npm install
```
