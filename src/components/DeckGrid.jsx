import { formatFundingRange, isRecentDeck } from '../lib/database'
import { Lock, FileText } from 'lucide-react'

export default function DeckGrid({ decks, loading, onDeckClick }) {
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="space-y-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 aspect-[16/9] rounded-2xl mb-6"></div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (decks.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="text-center py-24">
          <div className="text-gray-300 mb-8">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-normal text-gray-900 mb-3 tracking-wide">No decks found</h3>
          <p className="text-gray-400 font-normal">Try adjusting your filters to see more results.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12">
      <div className="space-y-12">
        {decks.map((deck) => (
          <DeckCard 
            key={deck.id} 
            deck={deck} 
            onClick={() => onDeckClick(deck)} 
          />
        ))}
      </div>
    </div>
  )
}

function DeckCard({ deck, onClick }) {
  const isPremium = isRecentDeck(deck.submitted_at)
  const needsSubscription = isPremium // This would check user subscription status

  return (
    <div 
      className="deck-card group cursor-pointer transition-all duration-300 hover:scale-[1.01]"
      onClick={onClick}
    >
      {/* Deck Thumbnail - 16:9 aspect ratio */}
      <div className="relative aspect-[16/9] bg-gray-50 rounded-2xl overflow-hidden mb-6 shadow-sm hover:shadow-xl transition-all duration-300">
        {deck.thumbnail_url ? (
          <img 
            src={deck.thumbnail_url} 
            alt={deck.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        
        {/* Premium indicator */}
        {needsSubscription && (
          <div className="absolute top-4 right-4 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-normal flex items-center tracking-wide">
            <Lock className="h-3 w-3 mr-1.5" />
            PRO
          </div>
        )}

        {/* Hover overlay with "View Deck" button - only on non-touch devices */}
        <div className="deck-hover-overlay hidden md:flex">
          <div className="bg-white text-black px-6 py-3 rounded-lg font-medium text-sm tracking-wide flex items-center shadow-lg">
            <FileText className="h-4 w-4 mr-2" />
            View Deck
          </div>
        </div>
      </div>

      {/* Deck Info - Minimal */}
      <div className="space-y-3">
        <h3 className="text-xl font-normal text-gray-900 group-hover:text-black transition-colors tracking-wide leading-relaxed">
          {deck.title}
        </h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 font-normal">
          {deck.categories && (
            <span className="tracking-wide">
              {deck.categories.name}
            </span>
          )}
          <span className="text-gray-300">•</span>
          <span className="tracking-wide">{formatFundingRange(deck.funding_min, deck.funding_max)}</span>
          {deck.location && (
            <>
              <span className="text-gray-300">•</span>
              <span className="tracking-wide">{deck.location}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
