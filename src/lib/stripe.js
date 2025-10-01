import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RcRZ7ROfuVvHq4GOpRFrw2ssVSmq4kcB9d2yJP9RNo2jrauO3XGsLLrqvAEXgvBcuO7FDOrxczpGJSbR2NlKGJh00UBxaBpxx'

export const stripePromise = loadStripe(stripePublishableKey)
