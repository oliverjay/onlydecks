# OnlyDecks Email Notifications Setup

Get notified at **oli@zoo.studio** when:
- ✅ A new deck is submitted for review
- ✅ Someone signs up to the newsletter

## Quick Setup (5 minutes)

### Step 1: Run the SQL

Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/txlnensotksykgwrxdrw/sql/new) and run:

```sql
-- Copy and paste the contents of database/notifications-setup.sql
```

### Step 2: Deploy Edge Functions

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
cd /path/to/onlydecks
supabase link --project-ref txlnensotksykgwrxdrw

# Deploy the notification functions
supabase functions deploy notify-deck-submission
supabase functions deploy notify-newsletter-signup
```

### Step 3: Set Up Resend (Free Email Sending)

1. Go to [resend.com](https://resend.com) and create a free account
2. Get your API key from the dashboard
3. Add it to Supabase:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxx
```

Or add it in the Dashboard:
- Go to **Edge Functions** > **notify-deck-submission** > **Secrets**
- Add `RESEND_API_KEY` with your Resend API key
- Repeat for **notify-newsletter-signup**

### Step 4: Create Database Webhooks

1. Go to [Supabase Dashboard > Database > Webhooks](https://supabase.com/dashboard/project/txlnensotksykgwrxdrw/database/hooks)

2. **Create webhook for deck submissions:**
   - Click "Create a new hook"
   - Name: `notify-deck-submission`
   - Table: `decks`
   - Events: ☑️ Insert
   - Type: `Supabase Edge Functions`
   - Edge Function: `notify-deck-submission`
   - HTTP Headers: (leave empty)
   - Click "Create webhook"

3. **Create webhook for newsletter:**
   - Click "Create a new hook"
   - Name: `notify-newsletter-signup`
   - Table: `newsletter_subscribers`
   - Events: ☑️ Insert
   - Type: `Supabase Edge Functions`
   - Edge Function: `notify-newsletter-signup`
   - HTTP Headers: (leave empty)
   - Click "Create webhook"

## Testing

### Test Deck Submission Notification
Submit a test deck on the site and check your email.

### Test Newsletter Notification
Subscribe to the newsletter with a test email and check your inbox.

### Check Notification Logs
```sql
SELECT * FROM recent_notifications ORDER BY sent_at DESC;
```

## Customization

### Change Notification Email
Edit the `NOTIFY_EMAIL` constant in both functions:
- `supabase/functions/notify-deck-submission/index.ts`
- `supabase/functions/notify-newsletter-signup/index.ts`

### Change Email Sender
In Resend dashboard, verify your domain (onlydecks.io) to send from:
`notifications@onlydecks.io`

Until verified, emails will come from Resend's default sender.

## Alternative: No Email Service

If you prefer not to use Resend, notifications will be logged to the database.
View them with:

```sql
SELECT * FROM notification_logs ORDER BY sent_at DESC;
```

You could also:
1. Set up a daily digest email using Supabase scheduled functions
2. Use a different email provider (Postmark, SendGrid, etc.)
3. Send to a Slack/Discord webhook instead

## Troubleshooting

### Emails not sending?
1. Check Edge Function logs in Supabase Dashboard
2. Verify `RESEND_API_KEY` is set correctly
3. Check `notification_logs` table for entries

### Webhooks not firing?
1. Verify webhooks are enabled in Dashboard > Database > Webhooks
2. Check the function logs for errors
3. Make sure the table names match exactly (`decks`, `newsletter_subscribers`)

## Files

```
supabase/
├── config.toml
├── functions/
│   ├── notify-deck-submission/
│   │   └── index.ts
│   └── notify-newsletter-signup/
│       └── index.ts
└── NOTIFICATIONS-SETUP.md

database/
└── notifications-setup.sql
```
