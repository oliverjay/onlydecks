-- =====================================================
-- OnlyDecks: Email Notification Setup
-- =====================================================
-- This SQL sets up database triggers to notify you when:
-- 1. A new deck is submitted
-- 2. Someone signs up for the newsletter
--
-- SETUP INSTRUCTIONS:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Then configure the webhooks in Dashboard (see below)
-- =====================================================

-- =====================================================
-- OPTION 1: Using Supabase Dashboard Webhooks (Recommended)
-- =====================================================
-- 
-- After deploying the Edge Functions, set up webhooks:
--
-- 1. Go to Supabase Dashboard > Database > Webhooks
-- 2. Create webhook for deck submissions:
--    - Name: notify-deck-submission
--    - Table: decks
--    - Events: INSERT
--    - Type: Supabase Edge Function
--    - Edge Function: notify-deck-submission
--
-- 3. Create webhook for newsletter signups:
--    - Name: notify-newsletter-signup
--    - Table: newsletter_subscribers
--    - Events: INSERT
--    - Type: Supabase Edge Function
--    - Edge Function: notify-newsletter-signup


-- =====================================================
-- OPTION 2: Using pg_net extension (Alternative - no Edge Functions needed)
-- =====================================================
-- This option uses PostgreSQL's pg_net extension to send HTTP requests
-- directly from the database. Useful if you have a webhook endpoint.

-- Enable the pg_net extension (already enabled on most Supabase projects)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a table to store notification logs (optional but useful)
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL,
  payload JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

-- Enable RLS on notification_logs
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access notification logs
CREATE POLICY "Service role only" ON notification_logs
  FOR ALL USING (auth.role() = 'service_role');


-- =====================================================
-- Function to log notifications (useful for debugging)
-- =====================================================
CREATE OR REPLACE FUNCTION log_notification(
  p_type TEXT,
  p_payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notification_logs (notification_type, payload)
  VALUES (p_type, p_payload)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;


-- =====================================================
-- Trigger function for deck submissions
-- =====================================================
CREATE OR REPLACE FUNCTION handle_deck_submission_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payload JSONB;
BEGIN
  -- Build notification payload
  v_payload := jsonb_build_object(
    'deck_id', NEW.id,
    'title', NEW.title,
    'contact_email', NEW.contact_email,
    'location', NEW.location,
    'funding_min', NEW.funding_min,
    'funding_max', NEW.funding_max,
    'pdf_url', NEW.pdf_url,
    'status', NEW.status,
    'submitted_at', NEW.created_at
  );
  
  -- Log the notification
  PERFORM log_notification('deck_submission', v_payload);
  
  -- Note: The actual email sending is handled by:
  -- - Supabase Dashboard Webhook (Option 1), OR
  -- - You can add pg_net.http_post here to call a webhook endpoint (Option 2)
  
  RETURN NEW;
END;
$$;

-- Create trigger for deck submissions
DROP TRIGGER IF EXISTS on_deck_submission ON decks;
CREATE TRIGGER on_deck_submission
  AFTER INSERT ON decks
  FOR EACH ROW
  EXECUTE FUNCTION handle_deck_submission_notification();


-- =====================================================
-- Trigger function for newsletter signups
-- =====================================================
CREATE OR REPLACE FUNCTION handle_newsletter_signup_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payload JSONB;
BEGIN
  -- Build notification payload
  v_payload := jsonb_build_object(
    'subscriber_id', NEW.id,
    'email', NEW.email,
    'frequency', NEW.frequency,
    'subscribed_at', NEW.created_at
  );
  
  -- Log the notification
  PERFORM log_notification('newsletter_signup', v_payload);
  
  RETURN NEW;
END;
$$;

-- Create trigger for newsletter signups
DROP TRIGGER IF EXISTS on_newsletter_signup ON newsletter_subscribers;
CREATE TRIGGER on_newsletter_signup
  AFTER INSERT ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION handle_newsletter_signup_notification();


-- =====================================================
-- View recent notifications (for debugging)
-- =====================================================
CREATE OR REPLACE VIEW recent_notifications AS
SELECT 
  id,
  notification_type,
  payload->>'title' AS deck_title,
  payload->>'email' AS subscriber_email,
  payload->>'contact_email' AS contact_email,
  sent_at,
  status
FROM notification_logs
ORDER BY sent_at DESC
LIMIT 50;


-- =====================================================
-- Grant access to the view
-- =====================================================
GRANT SELECT ON recent_notifications TO authenticated;


-- =====================================================
-- DONE! 
-- =====================================================
-- Next steps:
-- 1. If using Edge Functions (Option 1):
--    - Deploy the functions: supabase functions deploy
--    - Set up webhooks in Dashboard
--    - Add RESEND_API_KEY to Edge Function secrets
--
-- 2. Check notifications:
--    SELECT * FROM recent_notifications;
-- =====================================================
