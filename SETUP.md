# Hennie's Photos - Supabase Backend Setup

## Prerequisites

- Supabase account (free at https://supabase.com)
- Node.js installed
- Git configured
- Vercel/Railway/Render account (for deployment)

## Step-by-Step Setup

### 1. Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email or GitHub
4. Create a new project:
   - Project name: `hennies-photos`
   - Database password: Create a strong password
   - Region: Choose closest to you

### 2. Get Your Supabase Keys

1. Go to your Supabase dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. Copy these values:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_KEY` (Service Role Key - the longer one)
   - `SUPABASE_ANON_KEY` (Anon Public Key)

### 3. Clone This Repository

```bash
git clone https://github.com/boshoffhennie499-arch/hennies-photos-supabase.git
cd hennies-photos-supabase
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste the contents of `database.sql` (see below)
4. Click **Run**

#### database.sql
```sql
-- Create events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create photos table
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  price REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable storage
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 6. Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New Bucket**
3. Name it: `hennies-photos`
4. Make it **Public**
5. Click **Create**

### 7. Create `.env.local` File

In the project root, create `.env.local`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
NODE_ENV=development
PORT=3000
```

### 8. Test Locally

```bash
npm run dev
```

Your API will run at: `http://localhost:3000`

Test it:
```bash
curl http://localhost:3000/events
```

### 9. Deploy to Vercel (Easiest)

#### Option A: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add your environment variables when asked.

#### Option B: Deploy with GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click **New Project**
4. Import your GitHub repository
5. Add environment variables in settings
6. Click **Deploy**

You'll get a URL like: `https://hennies-photos-supabase.vercel.app`

### Alternative Deployment Platforms

**Railway.app** (Very easy):
```bash
npm i -g @railway/cli
railway login
railway up
```

**Render.com**:
1. Connect your GitHub repo
2. Create new Web Service
3. Add environment variables
4. Deploy

### 10. Update Your Frontend HTML

In your `index.html`, replace:
```javascript
const API_URL = '';
```

With:
```javascript
const API_URL = 'https://your-deployed-url.vercel.app';
```

---

## API Endpoints

### GET /events
Get all events with photos.

**Response:**
```json
{
  "events": [
    {
      "id": "event_123",
      "name": "Wedding 2024",
      "date": "December 15, 2024",
      "photos": [
        {"id": "PHOTO_1", "src": "https://...", "price": 0}
      ]
    }
  ]
}
```

### POST /events
Create a new event.

**Request:**
```json
{
  "id": "event_123",
  "name": "Wedding 2024",
  "date": "December 15, 2024"
}
```

### POST /photos
Upload photos to an event.

**Form data:**
- `eventId`: Event ID
- `photos`: Multiple image files (multipart/form-data)

### DELETE /events/:id
Delete an event and all its photos.

---

## Troubleshooting

### "Could not connect to Supabase"
- Check your `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Ensure the key is the **Service Role Key**, not Anon Key

### "Storage bucket not found"
- Go to Supabase dashboard → Storage
- Create bucket named `hennies-photos`
- Make it Public

### CORS errors
- Add your frontend URL to Supabase CORS settings
- Go to **Settings** → **API** → **CORS**

### Photos not uploading
- Check file size (free tier: 5GB limit)
- Verify bucket is public
- Check browser console for errors

---

## Cost

**Supabase Free Tier:**
- ✅ 500MB database
- ✅ 2GB file storage
- ✅ 50,000 reads/month (generous for small business)
- ✅ Unlimited bandwidth

**When you outgrow free tier:**
- Pro plan: $25/month (100GB storage)

**Perfect for starting your business!**

---

## Environment Variables Reference

| Variable | Description | Where to find |
|----------|-------------|----------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_KEY` | Service Role Key (for backend) | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Anon Key (for frontend) | Supabase Dashboard → Settings → API |
| `NODE_ENV` | Set to `production` when deployed | - |
| `PORT` | Server port (default: 3000) | - |

---

## Next Steps

1. ✅ Set up Supabase account
2. ✅ Create database tables
3. ✅ Create storage bucket
4. ✅ Run locally with `npm run dev`
5. ✅ Deploy to Vercel/Railway/Render
6. ✅ Update frontend with API URL
7. 🎉 Start taking orders!
