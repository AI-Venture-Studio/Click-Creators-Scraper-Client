# 🚀 Quick Start Guide

Get up and running in 5 minutes!

## ⚡ TL;DR

```bash
# 1. Set up database (do this ONCE)
# → Go to Supabase Dashboard → SQL Editor
# → Copy/paste contents of: client/database_setup.sql
# → Click "Run"

# 2. Start server (if not already running)
cd client
npm run dev

# 3. Open browser
# → http://localhost:3000
# → Login: kwaku / korankye / 123456
# → Start creating jobs! 🎉
```

## 📋 Complete Setup (First Time Only)

### Step 1: Database Setup (2 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `vfixvelgubfcznsyinhe`
3. Click **SQL Editor** (left sidebar)
4. Click **+ New Query**
5. Copy entire contents of `client/database_setup.sql`
6. Paste into SQL editor
7. Click **Run** (bottom right)
8. ✅ Success! You should see: "Success. No rows returned"

### Step 2: Verify Setup (30 seconds)

In the same SQL Editor, run:
```sql
SELECT * FROM scraping_jobs;
```

You should see empty table with columns:
- id, influencer, platform, num_vas, status, airtable_link, created_at, updated_at

### Step 3: Start Development Server (30 seconds)

```bash
cd /Users/amo-korankye/Desktop/amokorankye/dev/AIVS/callum\'s-instagram-scraper/instagram-scraper-app/client
npm run dev
```

Wait for: `✓ Ready in 2.4s`

### Step 4: Test the App (1 minute)

1. **Open**: http://localhost:3000
2. **Login**:
   - Username: `kwaku`
   - Password: `korankye`
   - OTP: `123456`
3. **You're in!** Should see `/configure` page

## 🎮 Using the App

### Create Your First Job

1. Fill out the form:
   - **Influencer Name**: `TestInfluencer`
   - **Platform**: `Instagram`
   - **Number of VAs**: `5`

2. Click **"Create Job"**

3. Enter Airtable link:
   - Example: `https://airtable.com/app123/tbl456`
   - Click **"Continue"**

4. Wait for progress bar (3 seconds)

5. **Done!** Redirected to dashboard

### View Jobs by Platform

1. In sidebar, click **Instagram**
2. See all Instagram jobs
3. Click any job card → opens dashboard

### Manage Recents

1. Recents show in sidebar (middle section)
2. Hover over any recent → trash icon appears
3. Click trash → removed from recents
4. Click recent item → opens dashboard

### Logout

1. Click **"Logout"** button (bottom of sidebar)
2. Returns to login page
3. **Note**: Recents stay in browser until you clear cache

## 🔍 Quick Verification

After creating a job, verify it worked:

**In Supabase:**
```sql
SELECT * FROM scraping_jobs ORDER BY created_at DESC LIMIT 5;
```
Should see your job!

**In Browser DevTools:**
1. Press F12
2. Application → Local Storage → http://localhost:3000
3. Key: `scraping_job_recents`
4. Should contain your job

## 🎯 What You Can Do Now

✅ **Create scraping jobs** for any platform (Instagram, Threads, TikTok, X)  
✅ **Link Airtable bases** to each job  
✅ **View jobs by platform** using sidebar  
✅ **Quick access** via recents  
✅ **Delete** from recents anytime  
✅ **Logout** and come back - recents stay!  

## 📚 More Info

- **Full Documentation**: `CONFIGURE_SYSTEM_README.md`
- **Visual Guide**: `VISUAL_FLOW_GUIDE.md`
- **Testing Checklist**: `TESTING_CHECKLIST.md`
- **Database Guide**: `DATABASE_SETUP_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`

## 🐛 Something Wrong?

### Server won't start?
```bash
# Try reinstalling dependencies
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database errors?
- Verify `.env.local` has correct Supabase credentials
- Re-run `database_setup.sql` in Supabase
- Check Supabase project is active

### Login not working?
- Check `.env.local` has login credentials:
  ```bash
  NEXT_PUBLIC_LOGIN_USERNAME=kwaku
  NEXT_PUBLIC_LOGIN_PASSWORD=korankye
  NEXT_PUBLIC_LOGIN_OTP=123456
  ```

### Jobs not saving?
- Check browser console (F12) for errors
- Verify Supabase connection
- Check RLS policies are enabled

## 💡 Pro Tips

1. **Create test data**: Make a few jobs with different platforms to test filtering
2. **Check recents limit**: Create 11+ jobs to see max 10 limit in action
3. **Test persistence**: Logout/login to verify recents stay
4. **Clear cache test**: Clear browser cache to verify recents clear but Supabase data stays

## 🎉 You're Ready!

Your scraping job configuration system is fully operational.

---

**Need Help?** Check the documentation files or look at browser console for errors.

**Current Server**: http://localhost:3000 (already running!) ✅
