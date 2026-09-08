# Deploy to Render.com - Complete Step-by-Step Guide

This guide will walk you through deploying your Hennie's Photos API to Render.com with screenshots and detailed explanations.

## Prerequisites

Before you start, make sure you have:
- ✅ GitHub account
- ✅ Render.com account (free at https://render.com)
- ✅ Supabase account with your API keys ready
- ✅ Your code pushed to GitHub

---

## Part 1: Prepare Your Supabase Keys (5 minutes)

Your Supabase project needs to be set up first. Get your API keys:

### Step 1.1: Go to Supabase Dashboard
1. Open https://supabase.com and log in
2. Click on your project (e.g., "hennies-photos")

### Step 1.2: Find Your API Settings
1. In the left sidebar, click **Settings**
2. Click **API** (you'll see it listed)
3. You should see a page like this:

```
┌─────────────────────────────────────────┐
│ Project URL                             │
│ https://your-project.supabase.co        │
│                                         │
│ Service Role Key                        │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ... │
│                                         │
│ Anon Public Key                         │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ... │
└─────────────────────────────────────────┘
```

### Step 1.3: Copy Your Keys
You need THREE values. Copy them to a text file (we'll paste them into Render soon):

1. **SUPABASE_URL** = The "Project URL" (starts with `https://`)
   - Example: `https://abcdef123456.supabase.co`

2. **SUPABASE_KEY** = The "Service Role Key" (the LONGER key, about 200+ characters)
   - ⚠️ **Important**: Use Service Role Key, NOT Anon Public Key

3. **SUPABASE_ANON_KEY** = The "Anon Public Key" (shorter, about 150 characters)

Save these values - you'll need them in the next part.

---

## Part 2: Set Up Your Supabase Database (5 minutes)

Before deploying, your Supabase needs tables and a storage bucket.

### Step 2.1: Create Database Tables

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click the **New Query** button (top right)
3. Delete any placeholder text
4. Copy and paste this SQL code:

```sql
-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read
CREATE POLICY "Allow public read on events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on photos" ON photos
  FOR SELECT USING (true);
```

5. Click the **Run** button (or press Ctrl+Enter)
6. Wait for success message ✅

### Step 2.2: Create Storage Bucket

1. In Supabase dashboard, click **Storage** (left sidebar)
2. Click **New Bucket** button
3. Fill in:
   - **Name**: `hennies-photos`
   - **Make it Public**: Toggle the switch to ON (blue)
4. Click **Create Bucket**

You should now see `hennies-photos` listed in your storage buckets.

---

## Part 3: Deploy to Render (10 minutes)

Now the main deployment!

### Step 3.1: Go to Render Dashboard

1. Open https://render.com in your browser
2. Log in with your GitHub account (or create account if needed)
3. Click **GitHub** to authorize Render to access your repos

### Step 3.2: Create New Web Service

1. In the Render dashboard (you should see a dashboard with your name)
2. Click **New +** button (top right corner)
3. Select **Web Service**

You'll see this screen:

```
┌───────────────────────────────────┐
│ Deploy a web service              │
│                                   │
│ Select a repository:              │
│ [Search repositories...]          │
│                                   │
│ Or paste a Git URL:               │
│ [https://...]                     │
└───────────────────────────────────┘
```

### Step 3.3: Connect Your GitHub Repository

1. In the search box, type: `hennies-photos-supabase`
2. Click on your repository when it appears
3. Click **Connect** button

Now you'll see a configuration form:

```
┌─────────────────────────────────────────┐
│ Name                                    │
│ [hennies-photos-api________]            │
│                                         │
│ Region                                  │
│ [Oregon (USA) ▼]                        │
│                                         │
│ Branch                                  │
│ [main ▼]                                │
│                                         │
│ Runtime                                 │
│ [Node ▼]                                │
│                                         │
│ Build Command                           │
│ [npm install________________]           │
│                                         │
│ Start Command                           │
│ [node server.js______________]          │
└─────────────────────────────────────────┘
```

### Step 3.4: Fill in the Configuration

Make sure these values are correct:

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `hennies-photos-api` | Choose a descriptive name |
| **Region** | Choose closest to you | Pick the region nearest to your location |
| **Branch** | `main` | Should be selected automatically |
| **Runtime** | `Node` | Should be selected automatically |
| **Build Command** | `npm install` | Should be pre-filled |
| **Start Command** | `node server.js` | Should be pre-filled |

### Step 3.5: Add Environment Variables

Scroll down to find the **Advanced** section and click it to expand.

You should see:

```
┌─────────────────────────────────────────┐
│ Advanced                                │
│                                         │
│ Auto-Deploy                             │
│ [Enabled ▼]                             │
│                                         │
│ Environment Variables                   │
│ + Add Environment Variable              │
└─────────────────────────────────────────┘
```

Click **+ Add Environment Variable** five times to add all variables:

**Variable 1:**
- Key: `SUPABASE_URL`
- Value: (paste your Supabase Project URL from Step 1.3)
- Example: `https://abcdef123456.supabase.co`

**Variable 2:**
- Key: `SUPABASE_KEY`
- Value: (paste your Service Role Key from Step 1.3)
- This is the LONGER key (200+ characters)

**Variable 3:**
- Key: `SUPABASE_ANON_KEY`
- Value: (paste your Anon Public Key from Step 1.3)
- This is the shorter key (150 characters)

**Variable 4:**
- Key: `NODE_ENV`
- Value: `production`

**Variable 5:**
- Key: `PORT`
- Value: `3000`

After adding all variables, it should look like:

```
Environment Variables:
✓ SUPABASE_URL = https://abcdef123456.supabase.co
✓ SUPABASE_KEY = eyJhbGciOiJI...
✓ SUPABASE_ANON_KEY = eyJhbGciOiJI...
✓ NODE_ENV = production
✓ PORT = 3000
```

### Step 3.6: Deploy!

1. Scroll to the bottom of the page
2. Click the **Create Web Service** button (blue button)
3. Wait for the deployment to complete

You'll see a logs window showing the build process:

```
Building...
npm install
  added 142 packages in 12.5s

Building server...
✓ Build complete

Starting server...
🚀 Server running on http://localhost:3000
📸 Hennie's Photos API is ready!
```

Once you see "Server running", your deployment is successful! ✅

---

## Part 4: Get Your Deployment URL (1 minute)

1. Wait for the build to complete (you'll see a green checkmark)
2. At the top of the page, you'll see your deployment URL:

```
Name: hennies-photos-api
Status: Live ✅
URL: https://hennies-photos-api.onrender.com
```

Copy this URL - you'll need it for your frontend!

### Test Your API

To verify it's working, open a new browser tab and go to:

```
https://hennies-photos-api.onrender.com/
```

You should see:

```json
{
  "message": "Hennie's Photos API is running",
  "version": "1.0.0"
}
```

If you see this, congratulations! 🎉 Your API is live!

---

## Part 5: Update Your Frontend (5 minutes)

Now you need to tell your frontend where your API is.

### Step 5.1: Find Your Frontend Code

Find your `index.html` file where you have photo ordering code. Look for a line like:

```javascript
const API_URL = '';
```

### Step 5.2: Update the URL

Replace it with your Render URL:

```javascript
const API_URL = 'https://hennies-photos-api.onrender.com';
```

### Step 5.3: Save and Test

1. Save the file
2. Refresh your website in the browser
3. Try uploading a photo or creating an event
4. Check the browser console (F12) for any errors

---

## Troubleshooting

### "Connection Refused" or "Service Unavailable"
- Wait 2-3 minutes for Render to fully start the service
- Refresh the page
- Check Render logs for errors (click your service → Logs tab)

### "Cannot connect to Supabase"
1. Go back to Render dashboard
2. Click your service
3. Click **Environment** tab
4. Verify all three Supabase keys are correct:
   - SUPABASE_URL should start with `https://`
   - SUPABASE_KEY should be 200+ characters
   - SUPABASE_ANON_KEY should be about 150 characters

### "Storage bucket not found"
- Go back to Supabase
- Click **Storage** in sidebar
- Verify you have a bucket named `hennies-photos`
- Make sure it's set to **Public** (not Private)

### API is very slow
- Free Render services go to sleep after 15 minutes of no traffic
- When someone visits after sleep, the first request takes 30+ seconds
- To fix: Upgrade to a paid Render plan (~$7/month)

---

## What's Next?

Your API is now deployed! Here's what you can do:

1. ✅ **Test the API**
   ```bash
   curl https://your-url/events
   ```

2. ✅ **Create events** using POST /events endpoint

3. ✅ **Upload photos** using POST /photos endpoint

4. ✅ **Monitor your API** in Render dashboard → Logs tab

5. ✅ **Scale up** when you need more storage (upgrade Supabase or Render plans)

---

## API Endpoints Reference

Your deployed API has these endpoints ready to use:

### GET /events
Get all events with photos

### POST /events
Create a new event
```json
{
  "id": "event_123",
  "name": "Wedding 2024",
  "date": "December 15, 2024"
}
```

### POST /photos
Upload photos (multipart form data)
- `eventId`: Event ID
- `photos`: Image files

### DELETE /events/:id
Delete an event and all its photos

---

## Support

If you get stuck:
1. Check the Render logs (Logs tab on your service)
2. Check Supabase status at https://status.supabase.com
3. Verify all environment variables are correct
4. Make sure your Supabase database tables exist

Happy photo selling! 📸
