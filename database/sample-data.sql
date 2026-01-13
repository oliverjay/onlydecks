-- Sample data for OnlyDecks development and testing
-- Run this after schema.sql in Supabase SQL Editor

-- Sample decks (these will appear as if submitted by different users)
INSERT INTO decks (
  title, 
  description, 
  category_id, 
  funding_min, 
  funding_max, 
  location, 
  pdf_url, 
  thumbnail_url, 
  status, 
  submitted_at,
  approved_at,
  fundraising_end_date
) VALUES
  (
    'AI-Powered Customer Support Platform',
    'Revolutionary AI chatbot that reduces customer support costs by 80% while improving satisfaction scores.',
    (SELECT id FROM categories WHERE slug = 'ai-ml'),
    100000000, -- $1M
    500000000, -- $5M
    'San Francisco, CA',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop',
    'approved',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day',
    '2026-03-15' -- Currently fundraising
  ),
  (
    'Sustainable Food Packaging Startup',
    'Biodegradable packaging solution made from agricultural waste, targeting the $350B packaging industry.',
    (SELECT id FROM categories WHERE slug = 'ecommerce'),
    250000000, -- $2.5M
    1000000000, -- $10M
    'Austin, TX',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=450&fit=crop',
    'approved',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days',
    '2025-12-01' -- Ended
  ),
  (
    'Next-Gen Fitness Tracking Wearable',
    'Advanced biometric monitoring device with 30-day battery life and medical-grade accuracy.',
    (SELECT id FROM categories WHERE slug = 'mobile-app'),
    500000000, -- $5M
    1500000000, -- $15M
    'Boston, MA',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&h=450&fit=crop',
    'approved',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '9 days',
    '2026-06-30' -- Currently fundraising
  ),
  (
    'Vertical Farming Technology',
    'Automated indoor farming system that produces 10x more yield per square foot than traditional farming.',
    (SELECT id FROM categories WHERE slug = 'other'),
    1000000000, -- $10M
    5000000000, -- $50M
    'Denver, CO',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=450&fit=crop',
    'approved',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '14 days',
    '2025-09-30' -- Ended
  ),
  (
    'Blockchain-Based Supply Chain',
    'Transparent supply chain tracking using blockchain technology for food safety and authenticity.',
    (SELECT id FROM categories WHERE slug = 'saas'),
    75000000, -- $750K
    300000000, -- $3M
    'New York, NY',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
    'approved',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '12 hours',
    '2026-02-28' -- Currently fundraising
  ),
  (
    'Smart Home Security System',
    'AI-powered home security with facial recognition and predictive threat detection.',
    (SELECT id FROM categories WHERE slug = 'ai-ml'),
    200000000, -- $2M
    800000000, -- $8M
    'Seattle, WA',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop',
    'approved',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days',
    '2025-11-15' -- Ended
  ),
  (
    'Digital Health Platform',
    'Telemedicine platform connecting patients with specialists using AI-powered diagnosis assistance.',
    (SELECT id FROM categories WHERE slug = 'healthtech'),
    300000000, -- $3M
    1200000000, -- $12M
    'Los Angeles, CA',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=450&fit=crop',
    'approved',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '7 days',
    '2026-04-30' -- Currently fundraising
  ),
  (
    'Renewable Energy Storage',
    'Advanced battery technology for residential solar energy storage with 20-year lifespan.',
    (SELECT id FROM categories WHERE slug = 'other'),
    2000000000, -- $20M
    10000000000, -- $100M
    'Phoenix, AZ',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=450&fit=crop',
    'approved',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '11 days',
    NULL -- No end date
  );

-- Add some pending decks for testing admin functionality
INSERT INTO decks (
  title, 
  description, 
  category_id, 
  funding_min, 
  funding_max, 
  location, 
  pdf_url, 
  thumbnail_url, 
  status, 
  submitted_at,
  fundraising_end_date
) VALUES
  (
    'EdTech Learning Platform',
    'Personalized learning platform using AI to adapt to individual student needs and learning styles.',
    (SELECT id FROM categories WHERE slug = 'saas'),
    150000000, -- $1.5M
    600000000, -- $6M
    'Chicago, IL',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=450&fit=crop',
    'pending',
    NOW() - INTERVAL '6 hours',
    '2026-05-15' -- Currently fundraising
  ),
  (
    'Sustainable Fashion Brand',
    'Eco-friendly clothing line made from recycled ocean plastic and organic materials.',
    (SELECT id FROM categories WHERE slug = 'ecommerce'),
    50000000, -- $500K
    200000000, -- $2M
    'Portland, OR',
    'https://txlnensotksykgwrxdrw.supabase.co/storage/v1/object/public/deck-pdfs/Koala_Deck.pdf',
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=450&fit=crop',
    'pending',
    NOW() - INTERVAL '3 hours',
    '2025-10-31' -- Ended
  );

-- Migration script for existing databases: Add fundraising_end_date column
-- ALTER TABLE decks ADD COLUMN IF NOT EXISTS fundraising_end_date DATE;

-- Update existing decks with random fundraising end dates
-- UPDATE decks SET fundraising_end_date = 
--   CASE 
--     WHEN random() > 0.5 THEN (CURRENT_DATE + (random() * 180)::integer)::date -- Future date
--     ELSE (CURRENT_DATE - (random() * 90)::integer)::date -- Past date
--   END
-- WHERE fundraising_end_date IS NULL;
