import { supabase } from './supabase.js'

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

// Decks
export async function getDecks(filters = {}) {
  // Fetch categories first for mapping
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
  
  const categoriesMap = {}
  if (categoriesData) {
    categoriesData.forEach(cat => {
      categoriesMap[cat.id] = { name: cat.name, slug: cat.slug }
    })
  }
  
  let query = supabase
    .from('decks')
    .select('*')
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false, nullsFirst: false })

  // Apply category filter
  if (filters.category) {
    // Get category ID first
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .single()
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }
  
  // Apply funding range filter
  if (filters.fundingRange) {
    const fundingRanges = {
      'under-50k': { min: 0, max: 5000000 },
      '50k-250k': { min: 5000000, max: 25000000 },
      '250k-1m': { min: 25000000, max: 100000000 },
      '1m-5m': { min: 100000000, max: 500000000 },
      '5m-10m': { min: 500000000, max: 1000000000 },
      '10m-plus': { min: 1000000000, max: null }
    }
    
    const range = fundingRanges[filters.fundingRange]
    if (range) {
      query = query.gte('funding_min', range.min)
      if (range.max) {
        query = query.lte('funding_min', range.max)
      }
    }
  }
  
  // Apply location filter
  if (filters.location) {
    const locationMap = {
      'north-america': ['San Francisco', 'Austin', 'Boston', 'Denver', 'New York', 'Seattle', 'Los Angeles', 'Phoenix', 'Chicago', 'Miami'],
      'uk': ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Leeds', 'Glasgow', 'Cambridge', 'Oxford'],
      'europe': ['Berlin', 'Paris', 'Amsterdam', 'Dublin', 'Stockholm', 'Barcelona', 'Munich', 'Zurich'],
      'asia-pacific': ['Singapore', 'Tokyo', 'Sydney', 'Hong Kong', 'Shanghai', 'Mumbai'],
      'other': []
    }
    
    const locations = locationMap[filters.location]
    if (locations && locations.length > 0) {
      // Use OR filter for multiple locations
      const locationFilters = locations.map(loc => `location.ilike.%${loc}%`).join(',')
      query = query.or(locationFilters)
    }
  }

  const { data, error } = await query
  
  if (error) throw error
  
  // Map categories to decks
  const decksWithCategories = (data || []).map(deck => ({
    ...deck,
    categories: categoriesMap[deck.category_id] || null
  }))
  
  // Sort: Currently fundraising first, then by submitted_at (newest first)
  const sortedData = decksWithCategories.sort((a, b) => {
    const now = new Date()
    const aFundraising = a.expires_at && new Date(a.expires_at) > now
    const bFundraising = b.expires_at && new Date(b.expires_at) > now
    
    // Currently fundraising comes first
    if (aFundraising && !bFundraising) return -1
    if (!aFundraising && bFundraising) return 1
    
    // Then sort by submitted_at (newest first)
    return new Date(b.submitted_at) - new Date(a.submitted_at)
  })
  
  return sortedData
}

export async function getDeck(id) {
  // Fetch deck
  const { data: deck, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single()
  
  if (error) throw error
  
  // Fetch category if deck has one
  if (deck && deck.category_id) {
    const { data: category } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('id', deck.category_id)
      .single()
    
    deck.categories = category || null
  }
  
  return deck
}

// Submit a new deck
export async function submitDeck(deckData) {
  const { data, error } = await supabase
    .from('decks')
    .insert([{
      title: deckData.title,
      contact_email: deckData.contact_email,
      category_id: deckData.category_id,
      funding_min: deckData.funding_min,
      funding_max: deckData.funding_max,
      location: deckData.location,
      pdf_url: deckData.pdf_url,
      thumbnail_url: deckData.thumbnail_url,
      expires_at: deckData.expires_at,
      status: 'pending'
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// File upload - anonymous uploads allowed
export async function uploadPDF(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('deck-pdfs')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('deck-pdfs')
    .getPublicUrl(fileName)
  
  return { path: data.path, url: publicUrl }
}

// Upload thumbnail image
export async function uploadThumbnail(blob, originalFileName) {
  const fileName = `thumb-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
  
  const { data, error } = await supabase.storage
    .from('deck-thumbnails')
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/png'
    })
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('deck-thumbnails')
    .getPublicUrl(fileName)
  
  return { path: data.path, url: publicUrl }
}

// Newsletter subscription
export async function subscribeToNewsletter(email, frequency = 'weekly') {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email, frequency }])
    .select()
    .single()
  
  if (error) {
    // If email already exists, that's okay
    if (error.code === '23505') {
      return { alreadySubscribed: true }
    }
    throw error
  }
  return data
}

// Comments
export async function getComments(deckId) {
  const { data, error } = await supabase
    .from('deck_comments')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error loading comments:', error)
    return []
  }
  return data || []
}

export async function submitComment(deckId, authorName, content) {
  const { data, error } = await supabase
    .from('deck_comments')
    .insert([{
      deck_id: deckId,
      author_name: authorName,
      content: content
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Analytics
export async function trackDeckView(deckId) {
  const { error } = await supabase
    .from('deck_views')
    .insert([{
      deck_id: deckId
    }])
  
  if (error) console.error('Error tracking deck view:', error)
}

export async function getDeckViewCount(deckId) {
  const { count, error } = await supabase
    .from('deck_views')
    .select('*', { count: 'exact', head: true })
    .eq('deck_id', deckId)
  
  if (error) {
    console.error('Error getting view count:', error)
    return 0
  }
  return count || 0
}

// Utility functions
export function formatFundingRange(min, max) {
  const formatAmount = (amount) => {
    if (amount >= 100000000) { // $1M+
      return `$${(amount / 100000000).toFixed(amount % 100000000 === 0 ? 0 : 1)}M`
    } else if (amount >= 100000) { // $1K+
      return `$${(amount / 100000).toFixed(0)}K`
    } else {
      return `$${(amount / 100).toFixed(0)}`
    }
  }
  
  if (min && max) {
    return `${formatAmount(min)} — ${formatAmount(max)}`
  } else if (min) {
    return `${formatAmount(min)}+`
  } else if (max) {
    return `Up to ${formatAmount(max)}`
  }
  return 'Not specified'
}

// Get locations for filter
export function getLocations() {
  return [
    { label: 'North America', value: 'north-america' },
    { label: 'UK', value: 'uk' },
    { label: 'Europe', value: 'europe' },
    { label: 'Asia Pacific', value: 'asia-pacific' },
    { label: 'Other', value: 'other' }
  ]
}
