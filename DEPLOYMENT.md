# Deploying #Trivia to Vercel

## Prerequisites

- Vercel account (free tier works great)
- Supabase project already set up (you have this!)
- Git repository (recommended)

## Quick Deploy Steps

### 1. Prepare Your Repository

First, let's make sure everything is committed:

```bash
git add .
git commit -m "Ready for deployment"
git push
```

If you don't have a Git repository yet:

```bash
git init
git add .
git commit -m "Initial commit"
# Then push to GitHub/GitLab/Bitbucket
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI (Fastest)**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set up project settings
# - Deploy!
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### 3. Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables (copy from your `.env.local`):

```
DATABASE_URL=postgresql://postgres:ALuB5OAqHoUxGoCv@db.iedmeezeuhdqeldywiwg.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://iedmeezeuhdqeldywiwg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_DB7bMefHVkej7sp1bfrM8g_N6XPbQsE
```

3. Make sure to add them for **Production**, **Preview**, and **Development** environments

### 4. Redeploy

After adding environment variables:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## Post-Deployment Checklist

### ✅ Test the Deployment

1. **Visit your deployed URL** (e.g., `https://your-app.vercel.app`)
2. **Create a game** - Click "Host a Game"
3. **Join as a player** - Open on your phone and scan the QR code
4. **Test real-time updates** - Make sure changes sync across devices

### ✅ Verify Database Connection

The app should connect to your Supabase database automatically. If you see database errors:

- Check that environment variables are set correctly
- Verify your Supabase database is accessible (not paused)
- Check Vercel deployment logs for errors

### ✅ Test Real-time Features

- Join with multiple devices
- Submit guesses and verify they appear on the host dashboard
- Advance phases and verify all players see the updates

## Custom Domain (Optional)

To use your own domain:

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain
3. Update DNS records as instructed
4. Vercel handles SSL automatically

## Troubleshooting

### "Database connection failed"

- Verify `DATABASE_URL` in Vercel environment variables
- Check Supabase project is not paused
- Ensure connection string includes password

### "Real-time not working"

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check browser console for errors
- Verify Supabase Realtime is enabled for your tables

### "Build failed"

- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run build` locally

### "Environment variables not working"

- Make sure variables are added to the correct environment (Production/Preview/Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

## Performance Tips

### Enable Vercel Analytics (Optional)

```bash
npm install @vercel/analytics
```

Then add to your root layout:

```tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Enable Vercel Speed Insights (Optional)

```bash
npm install @vercel/speed-insights
```

## Monitoring

- **Vercel Dashboard**: Monitor deployments, logs, and analytics
- **Supabase Dashboard**: Monitor database queries and real-time connections
- **Browser DevTools**: Check for client-side errors

## Updating Your Deployment

Whenever you make changes:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically deploy the changes!

Or use the CLI:

```bash
vercel --prod
```

## Cost Considerations

**Vercel Free Tier includes:**

- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Preview deployments

**Supabase Free Tier includes:**

- 500MB database
- 2GB bandwidth/month
- 50,000 monthly active users
- Realtime connections

Both should be more than enough for your game show event!

## Next Steps

1. Test thoroughly on multiple devices
2. Customize questions for your event
3. Share the URL with participants
4. Consider adding a custom domain for a professional touch

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
