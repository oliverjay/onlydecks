import { stripePromise } from './stripe.js'

// Create a subscription checkout session
export async function createSubscriptionCheckout() {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: 'price_weekly_subscription', // This would be created in Stripe Dashboard
        mode: 'subscription',
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancelled`,
      }),
    })

    const { sessionId } = await response.json()
    
    const stripe = await stripePromise
    const { error } = await stripe.redirectToCheckout({ sessionId })
    
    if (error) {
      console.error('Stripe checkout error:', error)
      throw error
    }
  } catch (error) {
    console.error('Payment error:', error)
    throw error
  }
}

// Check subscription status
export async function getSubscriptionStatus(userId) {
  try {
    const response = await fetch(`/api/subscription-status?userId=${userId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return { active: false }
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId) {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    })
    
    return await response.json()
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw error
  }
}

// Mock functions for development
export async function mockCreateSubscription() {
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock successful subscription
  return {
    success: true,
    subscriptionId: 'sub_mock_' + Date.now(),
    customerId: 'cus_mock_' + Date.now(),
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  }
}

export async function mockGetSubscriptionStatus(userId) {
  // Mock subscription status check
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // For demo purposes, return active subscription for any user
  return {
    active: true,
    subscriptionId: 'sub_mock_123',
    currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active'
  }
}
