# Autiste Vêtements - Setup Guide

## Database Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the content from `supabase-schema.sql`
5. Run the SQL script

This will create:
- `posts` table for storing products
- Row Level Security policies

## Storage Setup (IMPORTANT!)

1. In Supabase dashboard, go to **Storage**
2. Click **"New bucket"**
3. Name it: `images`
4. Make it **Public** (toggle the public option)
5. Click **Create bucket**

6. Click on the `images` bucket
7. Go to **Policies** tab
8. Click **"New policy"**
9. Select **"For full customization"**
10. Policy name: `Public Access`
11. Allowed operations: SELECT, INSERT, DELETE
12. Target roles: `public`
13. USING expression: `true`
14. Click **Save**

## Running the Site

Simply open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then visit:
- Main site: http://localhost:8000/index.html
- Admin panel: http://localhost:8000/admin.html

## How It Works

1. Go directly to `admin.html` (no login required)
2. Upload images from your computer
3. Create posts with multiple images, prices, tags
4. Posts automatically appear on the main site
5. Search works with product names and tags

## Next Steps

- Add payment integration (Stripe)
- Add cart persistence
- Add order management
