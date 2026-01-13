import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import DeckGrid from './components/DeckGrid'
import SubmitDeckModal from './components/SubmitDeckModal'
import SubscribeModal from './components/SubscribeModal'
import EnhancedPDFViewer from './components/EnhancedPDFViewer'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Guidelines from './pages/Guidelines'
import { getDecks, getCategories, getLocations, subscribeToNewsletter } from './lib/database'
import { Mail, Loader2, Check } from 'lucide-react'
import './App.css'

function App() {
  const [decks, setDecks] = useState([])
  const [allDecks, setAllDecks] = useState([]) // Unfiltered decks for counting
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    fundingRange: '',
    location: ''
  })
  
  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState(null)
  
  // Page states - check URL on initial load
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname
    if (path === '/terms') return 'terms'
    if (path === '/privacy') return 'privacy'
    if (path === '/guidelines') return 'guidelines'
    return 'home'
  })
  
  // Check for deck ID in URL on initial load
  const [initialDeckId] = useState(() => {
    const path = window.location.pathname
    const match = path.match(/^\/deck\/(.+)$/)
    return match ? match[1] : null
  })
  
  // Newsletter inline form state
  const [email, setEmail] = useState('')
  const [inlineFrequency, setInlineFrequency] = useState('weekly')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)
  const [subscribeError, setSubscribeError] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadDecks()
  }, [filters])
  
  // Load deck from URL on initial load
  useEffect(() => {
    if (initialDeckId && allDecks.length > 0) {
      const deck = allDecks.find(d => d.id === initialDeckId)
      if (deck) {
        setSelectedDeck(deck)
      }
    }
  }, [initialDeckId, allDecks])
  
  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      const match = path.match(/^\/deck\/(.+)$/)
      
      if (match) {
        const deckId = match[1]
        const deck = allDecks.find(d => d.id === deckId)
        if (deck) {
          setSelectedDeck(deck)
        }
      } else {
        setSelectedDeck(null)
        // Check for other pages
        if (path === '/terms') setCurrentPage('terms')
        else if (path === '/privacy') setCurrentPage('privacy')
        else if (path === '/guidelines') setCurrentPage('guidelines')
        else setCurrentPage('home')
      }
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [allDecks])

  const loadInitialData = async () => {
    try {
      setError(null)
      const [decksData, categoriesData, locationsData] = await Promise.all([
        getDecks({}),
        getCategories(),
        Promise.resolve(getLocations())
      ])
      
      setDecks(decksData || [])
      setAllDecks(decksData || [])
      setCategories(categoriesData || [])
      setLocations(locationsData || [])
    } catch (err) {
      console.error('Error loading initial data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadDecks = async () => {
    try {
      setLoading(true)
      const decksData = await getDecks(filters)
      setDecks(decksData || [])
    } catch (err) {
      console.error('Error loading decks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleDeckClick = (deck) => {
    setSelectedDeck(deck)
    window.history.pushState({ deckId: deck.id }, '', `/deck/${deck.id}`)
  }

  const handleClosePDFViewer = () => {
    setSelectedDeck(null)
    window.history.pushState({}, '', '/')
  }
  
  const handleSubmitSuccess = () => {
    // Reload decks after successful submission
    loadDecks()
  }
  
  const handleInlineSubscribe = async (e) => {
    e.preventDefault()
    setSubscribing(true)
    setSubscribeError(null)
    
    try {
      const result = await subscribeToNewsletter(email, inlineFrequency)
      if (result?.alreadySubscribed) {
        setSubscribeError('This email is already subscribed!')
      } else {
        setSubscribeSuccess(true)
        setEmail('')
        setInlineFrequency('weekly')
        setTimeout(() => setSubscribeSuccess(false), 5000)
      }
    } catch (err) {
      setSubscribeError('Something went wrong. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }
  
  // Show Terms, Privacy, or Guidelines page
  if (currentPage === 'terms') {
    return <TermsOfService onBack={() => { window.history.pushState({}, '', '/'); setCurrentPage('home') }} />
  }
  
  if (currentPage === 'privacy') {
    return <PrivacyPolicy onBack={() => { window.history.pushState({}, '', '/'); setCurrentPage('home') }} />
  }

  if (currentPage === 'guidelines') {
    return <Guidelines onBack={() => { window.history.pushState({}, '', '/'); setCurrentPage('home') }} />
  }

  if (loading && decks.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-normal">Loading decks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header 
        onInvestorClick={() => setShowSubscribeModal(true)}
        onSubmitClick={() => setShowSubmitModal(true)}
        onLogoClick={() => {
          setFilters({ category: '', fundingRange: '', location: '' })
          setCurrentPage('home')
          setSelectedDeck(null)
          window.history.pushState({}, '', '/')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
      
      <main className="flex-1 py-12">
        <FilterBar 
          categories={categories}
          locations={locations}
          filters={filters}
          onFilterChange={handleFilterChange}
          decks={allDecks}
        />
        
        <DeckGrid 
          decks={decks}
          loading={loading}
          onDeckClick={handleDeckClick}
        />
      </main>

      {/* Newsletter CTA Section */}
      <section className="bg-gray-50 border-t border-gray-100 py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Mail className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-normal text-gray-900 mb-4 tracking-wide">
            Get notified about new decks
          </h2>
          <p className="text-gray-700 font-normal mb-8 leading-relaxed">
            Get notified when new startup pitch decks are added. Join founders, investors, and startup enthusiasts.
          </p>
          
          {subscribeSuccess ? (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-normal">You're subscribed! We'll be in touch.</span>
            </div>
          ) : (
            <form onSubmit={handleInlineSubscribe} className="space-y-5 max-w-md mx-auto">
              {/* Frequency selector - hidden for now, keeping code for flexibility
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-normal">How often would you like updates?</p>
                <div className="flex gap-2 justify-center">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setInlineFrequency(option.value)}
                      className={`py-2.5 px-5 rounded-lg text-sm font-normal tracking-wide transition-all duration-200 ${
                        inlineFrequency === option.value
                          ? 'bg-black text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              */}

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full sm:flex-1 px-5 h-14 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-normal"
                />
                <Button 
                  type="submit"
                  className="bg-black text-white hover:bg-gray-900 px-10 h-14 rounded-lg font-normal text-sm tracking-wide transition-all duration-200 hover:shadow-lg whitespace-nowrap w-full sm:w-auto"
                  disabled={subscribing}
                >
                  {subscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </div>
            </form>
          )}
          
          {subscribeError && (
            <p className="text-red-600 text-sm mt-3 font-normal">{subscribeError}</p>
          )}
          
          <p className="text-xs text-gray-500 mt-4 font-normal">
            Free newsletter. No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => setCurrentPage('terms')}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors font-normal tracking-wide"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => setCurrentPage('privacy')}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors font-normal tracking-wide"
              >
                Privacy Policy
              </button>
            </div>
            <div className="text-xs text-gray-500 font-normal tracking-wide">
              © 2025 OnlyDecks. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SubmitDeckModal 
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        categories={categories}
        locations={locations}
        onSuccess={handleSubmitSuccess}
      />
      
      <SubscribeModal 
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
      />

      {/* PDF Viewer */}
      {selectedDeck && (
        <EnhancedPDFViewer 
          deck={selectedDeck}
          onClose={handleClosePDFViewer}
        />
      )}
    </div>
  )
}

export default App
