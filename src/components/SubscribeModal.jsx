import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { X, Check, Loader2, Mail } from 'lucide-react'
import { subscribeToNewsletter } from '../lib/database'

export default function SubscribeModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [frequency, setFrequency] = useState('weekly')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const result = await subscribeToNewsletter(email, frequency)
      
      if (result?.alreadySubscribed) {
        setError('This email is already subscribed!')
        setLoading(false)
        return
      }
      
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setEmail('')
        setFrequency('weekly')
      }, 2000)
      
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Newsletter signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-normal text-gray-900 tracking-wide mb-2">You're subscribed!</h2>
              <p className="text-gray-700 font-normal">We'll notify you when new decks are added.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 relative">
          {/* Close button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="absolute top-4 right-4 hover:bg-gray-50 rounded-lg"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Content */}
          <div className="text-center mb-8 pt-4">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4 leading-relaxed tracking-wide">
                Get notified about new decks
              </h3>
              <p className="text-gray-700 font-normal leading-relaxed">
                Join our newsletter to discover new startup pitch decks as they're added.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700 font-normal">
                  {error}
                </div>
              )}
              
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 h-14 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-normal"
              />

              {/* Frequency selector - hidden for now, keeping code for flexibility
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-normal">How often would you like updates?</p>
                <div className="flex gap-2">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFrequency(option.value)}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-normal tracking-wide transition-all duration-200 ${
                        frequency === option.value
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              */}
              
              <Button 
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-900 disabled:opacity-50 h-14 rounded-lg font-normal text-sm tracking-wide transition-all duration-200 hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
              
              <p className="text-xs text-gray-500 font-normal tracking-wide">
                Free newsletter. No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
