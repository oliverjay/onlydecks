import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { X, Check, Loader2, Mail } from 'lucide-react'

export default function InvestorModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Simulate newsletter signup
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In production, this would call your newsletter API
      console.log('Newsletter signup:', email)
      
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setEmail('')
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
              <h2 className="text-xl font-normal text-gray-900 tracking-wide mb-2">Welcome aboard!</h2>
              <p className="text-gray-600 font-normal">You'll receive early access to new pitch decks in your inbox.</p>
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
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-normal text-gray-900 tracking-wide">Investor Access</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-50 rounded-lg">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-normal text-gray-900 mb-4 leading-relaxed tracking-wide">
                Get early access to new pitch decks
              </h3>
              <p className="text-gray-600 font-normal leading-relaxed">
                Join our newsletter to see new startup pitch decks 7 days before they go public.
              </p>
            </div>

            <div className="space-y-4 text-left mb-8">
              <div className="flex items-center space-x-4">
                <Check className="h-4 w-4 text-gray-900 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-gray-700 font-normal tracking-wide">Weekly digest of new pitch decks</span>
              </div>
              <div className="flex items-center space-x-4">
                <Check className="h-4 w-4 text-gray-900 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-gray-700 font-normal tracking-wide">7-day early access to submissions</span>
              </div>
              <div className="flex items-center space-x-4">
                <Check className="h-4 w-4 text-gray-900 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-gray-700 font-normal tracking-wide">Curated startup insights</span>
              </div>
              <div className="flex items-center space-x-4">
                <Check className="h-4 w-4 text-gray-900 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-gray-700 font-normal tracking-wide">Unsubscribe anytime</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-normal"
              />
              
              <Button 
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-900 disabled:opacity-50 py-3 rounded-lg font-normal text-sm tracking-wide transition-all duration-200 hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Get Early Access'
                )}
              </Button>
              
              <p className="text-xs text-gray-400 font-normal tracking-wide">
                Free newsletter. No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-500 text-center font-normal leading-relaxed tracking-wide">
              Join hundreds of investors discovering the next big opportunity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
