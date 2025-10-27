# Supabase Review System Migration Guide

## Overview

The review system has been migrated from localStorage to Supabase for production-ready, centralized storage. This guide will help you complete the setup.

## ✅ What's Been Implemented

### 1. Supabase Client Setup
- ✅ Browser client (`lib/supabase/client.ts`)
- ✅ Server client with admin privileges (`lib/supabase/server.ts`)
- ✅ TypeScript database types (`lib/supabase/database.types.ts`)

### 2. Database Schema
- ✅ SQL migration file (`supabase/migrations/001_create_reviews_table.sql`)
- ✅ Reviews table with all necessary fields
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Sample data insertion

### 3. API Routes
- ✅ `GET /api/reviews` - Fetch reviews with filtering
- ✅ `POST /api/reviews` - Submit new reviews
- ✅ `GET /api/reviews/stats` - Get review statistics
- ✅ `PATCH /api/reviews/[id]` - Update review (admin)
- ✅ `DELETE /api/reviews/[id]` - Delete review (admin)

### 4. Service Layer
- ✅ Review service (`lib/services/review-service.ts`)
- ✅ All CRUD operations
- ✅ Statistics calculation
- ✅ Featured reviews fetching

### 5. Updated Components
- ✅ Reviews page (`app/reviews/page.tsx`)
- ✅ Testimonials section (`components/reviews/testimonials-section.tsx`)
- ✅ Homepage (removed localStorage initialization)

## 🚀 Setup Instructions

### Step 1: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Step 2: Get Supabase Credentials

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `vibecode` (deoktruccvehoadxlggl)

2. **Get API Keys:**
   - Go to Project Settings → API
   - Copy the following:
     - **Project URL**: `https://deoktruccvehoadxlggl.supabase.co`
     - **Anon/Public Key**: `eyJ...` (public key)
     - **Service Role Key**: `eyJ...` (secret key - keep secure!)

### Step 3: Update Environment Variables

Edit `.env.local` and replace the placeholder values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://deoktruccvehoadxlggl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

**⚠️ IMPORTANT:**
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in the browser
- The `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the client
- Never commit the service role key to version control

### Step 4: Run Database Migration

You have two options:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/deoktruccvehoadxlggl/editor
2. Click on "SQL Editor"
3. Copy the contents of `supabase/migrations/001_create_reviews_table.sql`
4. Paste and run the SQL
5. Verify the `reviews` table was created

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref deoktruccvehoadxlggl

# Run migrations
supabase db push
```

### Step 5: Verify Setup

1. **Check Database:**
   - Go to Supabase Dashboard → Table Editor
   - Verify `reviews` table exists with 6 sample reviews

2. **Test API:**
   ```bash
   # Start your dev server
   npm run dev
   
   # Test in another terminal
   curl http://localhost:3000/api/reviews
   ```

3. **Test UI:**
   - Visit http://localhost:3000/reviews
   - You should see the 6 sample reviews
   - Try submitting a new review

### Step 6: Clear Old localStorage Data (Optional)

If you had reviews in localStorage, you can clear them:

```javascript
// In browser console
localStorage.removeItem('phonetics_reviews');
```

## 📊 Database Schema

### Reviews Table

```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  helpful INTEGER DEFAULT 0,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

- `idx_reviews_approved` - Fast filtering of approved reviews
- `idx_reviews_rating` - Fast filtering by rating
- `idx_reviews_date` - Fast sorting by date

### Row Level Security (RLS)

- **SELECT**: Anyone can read approved reviews
- **INSERT**: Anyone can submit reviews (unapproved by default)
- **UPDATE**: Only service role (admin operations)
- **DELETE**: Only service role (admin operations)

## 🔐 Security

### RLS Policies

The database is protected by Row Level Security:

1. **Public Read**: Users can only see approved reviews
2. **Public Write**: Users can submit reviews (auto-unapproved)
3. **Admin Only**: Updates and deletes require service role key

### API Security

- All admin operations use `supabaseAdmin` client
- Public operations use regular `supabase` client
- Service role key never exposed to browser

## 🎯 API Endpoints

### GET /api/reviews

Fetch reviews with optional filtering:

```typescript
// Get all approved reviews
fetch('/api/reviews')

// Get 5-star reviews only
fetch('/api/reviews?rating=5')

// Get top 3 reviews
fetch('/api/reviews?limit=3')

// Get all reviews including unapproved (admin)
fetch('/api/reviews?approved=false')
```

### POST /api/reviews

Submit a new review:

```typescript
fetch('/api/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com', // optional
    rating: 5,
    title: 'Great tool!',
    comment: 'Really helped me learn...'
  })
})
```

### GET /api/reviews/stats

Get review statistics:

```typescript
fetch('/api/reviews/stats')
// Returns: { stats: { totalReviews, averageRating, ratingDistribution } }
```

### PATCH /api/reviews/[id]

Update a review (admin only):

```typescript
fetch('/api/reviews/abc-123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ approved: true })
})
```

### DELETE /api/reviews/[id]

Delete a review (admin only):

```typescript
fetch('/api/reviews/abc-123', { method: 'DELETE' })
```

## 🛠️ Development Workflow

### Adding a Review

1. User fills out form on `/reviews` page
2. Form calls `submitReview()` from `review-service.ts`
3. Service calls `POST /api/reviews`
4. API inserts review with `approved: false`
5. Review stored in Supabase but not displayed

### Approving a Review

Option 1: **Using API**
```typescript
import { approveReview } from '@/lib/services/review-service';
await approveReview('review-id-here');
```

Option 2: **Using Supabase Dashboard**
1. Go to Table Editor → reviews
2. Find the review
3. Change `approved` to `true`

Option 3: **Using SQL**
```sql
UPDATE reviews SET approved = true WHERE id = 'review-id-here';
```

## 📱 Testing

### Manual Testing

1. **Submit a review:**
   - Go to http://localhost:3000/reviews
   - Click "Write a Review Here"
   - Fill out and submit

2. **Verify in database:**
   - Go to Supabase Dashboard → Table Editor
   - Check `reviews` table
   - Find your review (should be `approved: false`)

3. **Approve the review:**
   - In Table Editor, change `approved` to `true`
   - Refresh `/reviews` page
   - Your review should now appear

4. **Test filtering:**
   - Submit reviews with different ratings
   - Use rating filter on `/reviews` page

### API Testing

```bash
# Get all reviews
curl http://localhost:3000/api/reviews

# Get stats
curl http://localhost:3000/api/reviews/stats

# Submit review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","rating":5,"title":"Test","comment":"Testing..."}'
```

## 🚨 Troubleshooting

### Error: "Missing Supabase environment variables"

- Check `.env.local` has all three Supabase variables
- Restart dev server after updating `.env.local`

### Error: "Failed to fetch reviews"

- Verify Supabase project is active (not paused)
- Check API keys are correct
- Verify database migration ran successfully

### Reviews not showing

- Check if reviews are approved in database
- Verify RLS policies are set up correctly
- Check browser console for errors

### Can't submit reviews

- Check network tab for API errors
- Verify `POST /api/reviews` endpoint is working
- Check Supabase logs for errors

## 🎉 Benefits of Supabase Migration

### Before (localStorage)
- ❌ Browser-specific storage
- ❌ No cross-device sync
- ❌ Can be cleared by user
- ❌ No centralized management
- ❌ No real-time updates

### After (Supabase)
- ✅ Centralized cloud storage
- ✅ Cross-device access
- ✅ Persistent and reliable
- ✅ Admin dashboard for management
- ✅ Real-time capabilities (can be added)
- ✅ Automatic backups
- ✅ Scalable infrastructure
- ✅ Built-in security (RLS)

## 📈 Next Steps

1. ✅ Complete Supabase setup
2. 🔄 Run database migration
3. 🔄 Test review submission
4. 🔄 Test review approval
5. 📋 Create admin panel for review moderation
6. 📋 Add email notifications for new reviews
7. 📋 Implement real-time review updates
8. 📋 Add review analytics dashboard

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript with Supabase](https://supabase.com/docs/reference/javascript/typescript-support)

---

**Questions?** Check the code comments in each file or refer to the original `docs/review-system-guide.md`

