-- OnlyDecks Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('SaaS', 'saas'),
  ('Physical Product', 'physical-product'),
  ('Media', 'media'),
  ('Brick & Mortar', 'brick-mortar'),
  ('Real-estate', 'real-estate'),
  ('Other', 'other');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  is_investor BOOLEAN DEFAULT FALSE,
  subscription_status VARCHAR(20) DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled'
  subscription_id VARCHAR(255), -- Stripe subscription ID
  customer_id VARCHAR(255), -- Stripe customer ID
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Decks table
CREATE TABLE decks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  funding_min BIGINT, -- in cents (USD)
  funding_max BIGINT, -- in cents (USD)
  location VARCHAR(100),
  pdf_url TEXT NOT NULL,
  thumbnail_url TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
  expires_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table (for tracking Stripe subscriptions)
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'past_due', etc.
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deck views tracking (optional analytics)
CREATE TABLE deck_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories are public
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Decks policies
CREATE POLICY "Approved decks are viewable by everyone" ON decks
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own submitted decks" ON decks
  FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "Users can insert own decks" ON decks
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update own pending decks" ON decks
  FOR UPDATE USING (auth.uid() = submitted_by AND status = 'pending');

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Deck views policies
CREATE POLICY "Users can insert deck views" ON deck_views
  FOR INSERT WITH CHECK (true);

-- Functions

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid 
    AND subscription_status = 'active' 
    AND subscription_expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get decks based on user subscription status
CREATE OR REPLACE FUNCTION get_accessible_decks(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  category_name VARCHAR(50),
  funding_min BIGINT,
  funding_max BIGINT,
  location VARCHAR(100),
  pdf_url TEXT,
  thumbnail_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  is_premium BOOLEAN
) AS $$
BEGIN
  -- If user has active subscription, return all approved decks
  IF user_uuid IS NOT NULL AND has_active_subscription(user_uuid) THEN
    RETURN QUERY
    SELECT 
      d.id,
      d.title,
      d.description,
      c.name as category_name,
      d.funding_min,
      d.funding_max,
      d.location,
      d.pdf_url,
      d.thumbnail_url,
      d.submitted_at,
      (d.submitted_at > NOW() - INTERVAL '7 days') as is_premium
    FROM decks d
    LEFT JOIN categories c ON d.category_id = c.id
    WHERE d.status = 'approved'
    ORDER BY d.submitted_at DESC;
  ELSE
    -- Return only decks older than 7 days for non-subscribers
    RETURN QUERY
    SELECT 
      d.id,
      d.title,
      d.description,
      c.name as category_name,
      d.funding_min,
      d.funding_max,
      d.location,
      d.pdf_url,
      d.thumbnail_url,
      d.submitted_at,
      FALSE as is_premium
    FROM decks d
    LEFT JOIN categories c ON d.category_id = c.id
    WHERE d.status = 'approved' 
    AND d.submitted_at <= NOW() - INTERVAL '7 days'
    ORDER BY d.submitted_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('deck-pdfs', 'deck-pdfs', true);

-- Storage policies
CREATE POLICY "PDF uploads are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'deck-pdfs');

CREATE POLICY "Authenticated users can upload PDFs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'deck-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own PDF uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'deck-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own PDF uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'deck-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
