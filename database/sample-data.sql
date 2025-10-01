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
  approved_at
) VALUES
  (
    'AI-Powered Customer Support Platform',
    'Revolutionary AI chatbot that reduces customer support costs by 80% while improving satisfaction scores.',
    (SELECT id FROM categories WHERE slug = 'saas'),
    100000000, -- $1M
    500000000, -- $5M
    'San Francisco, CA',
    'https://example.com/sample-deck-1.pdf',
    'https://example.com/sample-thumb-1.jpg',
    'approved',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'Sustainable Food Packaging Startup',
    'Biodegradable packaging solution made from agricultural waste, targeting the $350B packaging industry.',
    (SELECT id FROM categories WHERE slug = 'physical-product'),
    250000000, -- $2.5M
    1000000000, -- $10M
    'Austin, TX',
    'https://example.com/sample-deck-2.pdf',
    'https://example.com/sample-thumb-2.jpg',
    'approved',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'Next-Gen Fitness Tracking Wearable',
    'Advanced biometric monitoring device with 30-day battery life and medical-grade accuracy.',
    (SELECT id FROM categories WHERE slug = 'physical-product'),
    500000000, -- $5M
    1500000000, -- $15M
    'Boston, MA',
    'https://example.com/sample-deck-3.pdf',
    'https://example.com/sample-thumb-3.jpg',
    'approved',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '9 days'
  ),
  (
    'Vertical Farming Technology',
    'Automated indoor farming system that produces 10x more yield per square foot than traditional farming.',
    (SELECT id FROM categories WHERE slug = 'other'),
    1000000000, -- $10M
    5000000000, -- $50M
    'Denver, CO',
    'https://example.com/sample-deck-4.pdf',
    'https://example.com/sample-thumb-4.jpg',
    'approved',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '14 days'
  ),
  (
    'Blockchain-Based Supply Chain',
    'Transparent supply chain tracking using blockchain technology for food safety and authenticity.',
    (SELECT id FROM categories WHERE slug = 'saas'),
    75000000, -- $750K
    300000000, -- $3M
    'New York, NY',
    'https://example.com/sample-deck-5.pdf',
    'https://example.com/sample-thumb-5.jpg',
    'approved',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '12 hours'
  ),
  (
    'Smart Home Security System',
    'AI-powered home security with facial recognition and predictive threat detection.',
    (SELECT id FROM categories WHERE slug = 'physical-product'),
    200000000, -- $2M
    800000000, -- $8M
    'Seattle, WA',
    'https://example.com/sample-deck-6.pdf',
    'https://example.com/sample-thumb-6.jpg',
    'approved',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'Digital Health Platform',
    'Telemedicine platform connecting patients with specialists using AI-powered diagnosis assistance.',
    (SELECT id FROM categories WHERE slug = 'saas'),
    300000000, -- $3M
    1200000000, -- $12M
    'Los Angeles, CA',
    'https://example.com/sample-deck-7.pdf',
    'https://example.com/sample-thumb-7.jpg',
    'approved',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '7 days'
  ),
  (
    'Renewable Energy Storage',
    'Advanced battery technology for residential solar energy storage with 20-year lifespan.',
    (SELECT id FROM categories WHERE slug = 'physical-product'),
    2000000000, -- $20M
    10000000000, -- $100M
    'Phoenix, AZ',
    'https://example.com/sample-deck-8.pdf',
    'https://example.com/sample-thumb-8.jpg',
    'approved',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '11 days'
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
  submitted_at
) VALUES
  (
    'EdTech Learning Platform',
    'Personalized learning platform using AI to adapt to individual student needs and learning styles.',
    (SELECT id FROM categories WHERE slug = 'saas'),
    150000000, -- $1.5M
    600000000, -- $6M
    'Chicago, IL',
    'https://example.com/sample-deck-pending-1.pdf',
    'https://example.com/sample-thumb-pending-1.jpg',
    'pending',
    NOW() - INTERVAL '6 hours'
  ),
  (
    'Sustainable Fashion Brand',
    'Eco-friendly clothing line made from recycled ocean plastic and organic materials.',
    (SELECT id FROM categories WHERE slug = 'physical-product'),
    50000000, -- $500K
    200000000, -- $2M
    'Portland, OR',
    'https://example.com/sample-deck-pending-2.pdf',
    'https://example.com/sample-thumb-pending-2.jpg',
    'pending',
    NOW() - INTERVAL '3 hours'
  );
