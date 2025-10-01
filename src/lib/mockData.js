// Mock data for development and testing
export const mockCategories = [
  { id: '1', name: 'SaaS', slug: 'saas' },
  { id: '2', name: 'Physical Product', slug: 'physical-product' },
  { id: '3', name: 'Media', slug: 'media' },
  { id: '4', name: 'Brick & Mortar', slug: 'brick-mortar' },
  { id: '5', name: 'Real-estate', slug: 'real-estate' },
  { id: '6', name: 'Other', slug: 'other' }
]

export const mockDecks = [
  {
    id: '1',
    title: 'AI-Powered Customer Support Platform',
    description: 'Revolutionary AI chatbot that reduces customer support costs by 80% while improving satisfaction scores.',
    categories: { name: 'SaaS', slug: 'saas' },
    funding_min: 100000000, // $1M in cents
    funding_max: 500000000, // $5M in cents
    location: 'San Francisco, CA',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
    status: 'approved',
    submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: '2',
    title: 'Sustainable Food Packaging Startup',
    description: 'Biodegradable packaging solution made from agricultural waste, targeting the $350B packaging industry.',
    categories: { name: 'Physical Product', slug: 'physical-product' },
    funding_min: 250000000, // $2.5M in cents
    funding_max: 1000000000, // $10M in cents
    location: 'Austin, TX',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
    status: 'approved',
    submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: '3',
    title: 'Next-Gen Fitness Tracking Wearable',
    description: 'Advanced biometric monitoring device with 30-day battery life and medical-grade accuracy.',
    categories: { name: 'Physical Product', slug: 'physical-product' },
    funding_min: 500000000, // $5M in cents
    funding_max: 1500000000, // $15M in cents
    location: 'Boston, MA',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail_url: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&h=300&fit=crop',
    status: 'approved',
    submitted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: '4',
    title: 'Vertical Farming Technology',
    description: 'Automated indoor farming system that produces 10x more yield per square foot than traditional farming.',
    categories: { name: 'Other', slug: 'other' },
    funding_min: 1000000000, // $10M in cents
    funding_max: 5000000000, // $50M in cents
    location: 'Denver, CO',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
    status: 'approved',
    submitted_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  },
  {
    id: '5',
    title: 'Blockchain-Based Supply Chain',
    description: 'Transparent supply chain tracking using blockchain technology for food safety and authenticity.',
    categories: { name: 'SaaS', slug: 'saas' },
    funding_min: 75000000, // $750K in cents
    funding_max: 300000000, // $3M in cents
    location: 'New York, NY',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
    status: 'approved',
    submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '6',
    title: 'Smart Home Security System',
    description: 'AI-powered home security with facial recognition and predictive threat detection.',
    categories: { name: 'Physical Product', slug: 'physical-product' },
    funding_min: 200000000, // $2M in cents
    funding_max: 800000000, // $8M in cents
    location: 'Seattle, WA',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    status: 'approved',
    submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: '7',
    title: 'Digital Health Platform',
    description: 'Telemedicine platform connecting patients with specialists using AI-powered diagnosis assistance.',
    categories: { name: 'SaaS', slug: 'saas' },
    funding_min: 300000000, // $3M in cents
    funding_max: 1200000000, // $12M in cents
    location: 'Los Angeles, CA',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
    status: 'approved',
    submitted_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
  },
  {
    id: '8',
    title: 'Renewable Energy Storage',
    description: 'Advanced battery technology for residential solar energy storage with 20-year lifespan.',
    categories: { name: 'Physical Product', slug: 'physical-product' },
    funding_min: 2000000000, // $20M in cents
    funding_max: 10000000000, // $100M in cents
    location: 'Phoenix, AZ',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    thumbnail_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    status: 'approved',
    submitted_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
  }
]

// Mock functions that simulate database calls
export async function getMockCategories() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockCategories
}

export async function getMockLocations() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Get unique locations from all decks
  const uniqueLocations = [...new Set(mockDecks.map(deck => deck.location))]
  return uniqueLocations.sort().map(location => ({
    label: location,
    value: location
  }))
}

export async function getMockDecks(filters = {}) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  let filteredDecks = [...mockDecks]
  
  // Apply category filter
  if (filters.category) {
    filteredDecks = filteredDecks.filter(deck => 
      deck.categories.slug === filters.category
    )
  }
  
  // Apply funding range filter
  if (filters.fundingRange) {
    const fundingRanges = {
      'under-50k': { min: 0, max: 5000000 },
      '50k-250k': { min: 5000000, max: 25000000 },
      '250k-1m': { min: 25000000, max: 100000000 },
      '1m-5m': { min: 100000000, max: 500000000 },
      '5m-10m': { min: 500000000, max: 1000000000 },
      '10m-plus': { min: 1000000000, max: Infinity }
    }
    
    const range = fundingRanges[filters.fundingRange]
    if (range) {
      filteredDecks = filteredDecks.filter(deck => 
        deck.funding_min >= range.min && deck.funding_min <= range.max
      )
    }
  }
  
  // Apply location filter
  if (filters.location) {
    filteredDecks = filteredDecks.filter(deck => 
      deck.location === filters.location
    )
  }
  
  // Apply date range filter
  if (filters.dateRange) {
    const days = parseInt(filters.dateRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    // For "7+ days ago", show decks that are 7 or more days old
    filteredDecks = filteredDecks.filter(deck => 
      new Date(deck.submitted_at) <= cutoffDate
    )
  }
  
  return filteredDecks
}
