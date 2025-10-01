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
  let query = supabase
    .from('decks')
    .select(`
      *,
      categories (
        name,
        slug
      )
    `)
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false })

  // Apply filters
  if (filters.category) {
    query = query.eq('categories.slug', filters.category)
  }
  
  if (filters.fundingMin && filters.fundingMax) {
    query = query
      .gte('funding_min', filters.fundingMin * 100) // Convert to cents
      .lte('funding_max', filters.fundingMax * 100)
  }
  
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }
  
  if (filters.dateRange) {
    const days = parseInt(filters.dateRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    query = query.gte('submitted_at', cutoffDate.toISOString())
  }

  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getDeck(id) {
  const { data, error } = await supabase
    .from('decks')
    .select(`
      *,
      categories (
        name,
        slug
      )
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single()
  
  if (error) throw error
  return data
}

export async function getAccessibleDecks(userId = null) {
  // This would call the database function we created
  const { data, error } = await supabase
    .rpc('get_accessible_decks', { user_uuid: userId })
  
  if (error) throw error
  return data
}

export async function submitDeck(deckData) {
  const { data, error } = await supabase
    .from('decks')
    .insert([{
      ...deckData,
      submitted_by: (await supabase.auth.getUser()).data.user?.id,
      status: 'pending'
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// User profiles
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createProfile(userData) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([userData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Subscriptions
export async function hasActiveSubscription(userId) {
  const { data, error } = await supabase
    .rpc('has_active_subscription', { user_uuid: userId })
  
  if (error) throw error
  return data
}

export async function updateSubscriptionStatus(userId, subscriptionData) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_status: subscriptionData.status,
      subscription_id: subscriptionData.subscriptionId,
      customer_id: subscriptionData.customerId,
      subscription_expires_at: subscriptionData.expiresAt
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// File upload
export async function uploadPDF(file, userId) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('deck-pdfs')
    .upload(fileName, file)
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('deck-pdfs')
    .getPublicUrl(fileName)
  
  return { path: data.path, url: publicUrl }
}

// Analytics
export async function trackDeckView(deckId, userId = null) {
  const { error } = await supabase
    .from('deck_views')
    .insert([{
      deck_id: deckId,
      user_id: userId
    }])
  
  if (error) console.error('Error tracking deck view:', error)
}

// Utility functions
export function formatFundingRange(min, max) {
  const formatAmount = (amount) => {
    if (amount >= 100000000) { // $1M+
      return `$${(amount / 100000000).toFixed(amount % 100000000 === 0 ? 0 : 1)}M`
    } else if (amount >= 100000) { // $1K+
      return `$${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 0)}K`
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

export function isRecentDeck(submittedAt) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return new Date(submittedAt) > sevenDaysAgo
}
