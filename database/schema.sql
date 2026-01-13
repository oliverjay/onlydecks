-- OnlyDecks Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories (only if not exists)
INSERT INTO categories (name, slug) VALUES
  ('SaaS', 'saas'),
  ('Mobile App', 'mobile-app'),
  ('Website/Platform', 'website-platform'),
  ('AI/ML', 'ai-ml'),
  ('E-commerce', 'ecommerce'),
  ('Fintech', 'fintech'),
  ('Healthtech', 'healthtech'),
  ('Other', 'other')
ON CONFLICT (slug) DO NOTHING;

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  frequency VARCHAR(20) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Migration: Add frequency column if it doesn't exist
-- Run this if you're updating an existing database:
-- ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS frequency VARCHAR(20) DEFAULT 'weekly';

-- Decks table
CREATE TABLE IF NOT EXISTS decks (
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
  fundraising_end_date DATE, -- when fundraising round ends
  contact_email VARCHAR(255),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration: Add fundraising_end_date column if it doesn't exist
-- Run this if you're updating an existing database:
-- ALTER TABLE decks ADD COLUMN IF NOT EXISTS fundraising_end_date DATE;

-- Deck views tracking (optional analytics)
CREATE TABLE IF NOT EXISTS deck_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Categories are public
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Decks policies
DROP POLICY IF EXISTS "Approved decks are viewable by everyone" ON decks;
CREATE POLICY "Approved decks are viewable by everyone" ON decks
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Anyone can insert decks" ON decks;
CREATE POLICY "Anyone can insert decks" ON decks
  FOR INSERT WITH CHECK (true);

-- Deck views policies
DROP POLICY IF EXISTS "Anyone can insert deck views" ON deck_views;
CREATE POLICY "Anyone can insert deck views" ON deck_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read deck views" ON deck_views;
CREATE POLICY "Anyone can read deck views" ON deck_views
  FOR SELECT USING (true);

-- Newsletter policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_decks_updated_at ON decks;
CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for PDFs (run separately if bucket already exists)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('deck-pdfs', 'deck-pdfs', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for anonymous uploads
DROP POLICY IF EXISTS "PDF uploads are public" ON storage.objects;
CREATE POLICY "PDF uploads are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'deck-pdfs');

DROP POLICY IF EXISTS "Anyone can upload PDFs" ON storage.objects;
CREATE POLICY "Anyone can upload PDFs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'deck-pdfs');
