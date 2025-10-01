import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import DeckGrid from './components/DeckGrid'
import SubmitDeckModal from './components/SubmitDeckModal'
import InvestorModal from './components/InvestorModal'
import EnhancedPDFViewer from './components/EnhancedPDFViewer'
import { getMockDecks as getDecks, getMockCategories as getCategories, getMockLocations as getLocations } from './lib/mockData'
import './App.css'

function App() {
  const [decks, setDecks] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    fundingRange: '',
    location: '',
    dateRange: '7' // Default to 7+ days ago
  })
  
  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showInvestorModal, setShowInvestorModal] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadDecks()
  }, [filters])

  const loadInitialData = async () => {
    try {
      const [decksData, categoriesData, locationsData] = await Promise.all([
        getDecks({ dateRange: '7' }), // Load with default filter
        getCategories(),
        getLocations()
      ])
      setDecks(decksData)
      setCategories(categoriesData)
      setLocations(locationsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDecks = async () => {
    try {
      setLoading(true)
      const decksData = await getDecks(filters)
      setDecks(decksData)
    } catch (error) {
      console.error('Error loading decks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handlePremiumFilterClick = () => {
    setShowInvestorModal(true)
  }

  const handleDeckClick = (deck) => {
    setSelectedDeck(deck)
  }

  const handleClosePDFViewer = () => {
    setSelectedDeck(null)
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
        onInvestorClick={() => setShowInvestorModal(true)}
        onSubmitClick={() => setShowSubmitModal(true)}
      />
      
      <main className="flex-1 py-12">
        <FilterBar 
          categories={categories}
          locations={locations}
          filters={filters}
          onFilterChange={handleFilterChange}
          onPremiumFilterClick={handlePremiumFilterClick}
        />
        
        <DeckGrid 
          decks={decks}
          loading={loading}
          onDeckClick={handleDeckClick}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-8">
              <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-normal tracking-wide">
                Terms of Service
              </button>
              <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-normal tracking-wide">
                Privacy Policy
              </button>
            </div>
            <div className="text-xs text-gray-400 font-normal tracking-wide">
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
      />
      
      <InvestorModal 
        isOpen={showInvestorModal}
        onClose={() => setShowInvestorModal(false)}
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
