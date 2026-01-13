import { formatFundingRange } from '../lib/database'
import { FileText } from 'lucide-react'

export default function DeckGrid({ decks, loading, onDeckClick }) {
  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-16">
        <div className="space-y-14">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 aspect-[16/9] mb-3"></div>
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
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-16">
        <div className="text-center py-24">
          <div className="text-gray-400 mb-8">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-normal text-gray-900 mb-3 tracking-wide">No decks found</h3>
          <p className="text-gray-500 font-normal">Try adjusting your filters to see more results.</p>
        </div>
      </div>
    )
  }

  const firstDeck = decks[0]
  const remainingDecks = decks.slice(1)

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-16">
      {/* First deck - full width */}
      {firstDeck && (
        <div className="mb-16">
          <DeckCard 
            key={firstDeck.id} 
            deck={firstDeck} 
            onClick={() => onDeckClick(firstDeck)} 
          />
        </div>
      )}

      {/* Remaining decks - 2 column grid on larger screens */}
      {remainingDecks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-14 gap-x-8 lg:gap-x-12 lg:gap-y-16">
          {remainingDecks.map((deck) => (
            <DeckCard 
              key={deck.id} 
              deck={deck} 
              onClick={() => onDeckClick(deck)} 
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DeckCard({ deck, onClick }) {
  // Check if currently fundraising (end date is in the future or null)
  const isCurrentlyFundraising = deck.expires_at 
    ? new Date(deck.expires_at) > new Date() 
    : false

  return (
    <div 
      className="deck-card group cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`View ${deck.title} pitch deck`}
    >
      {/* Deck Thumbnail - 16:9 aspect ratio */}
      <div className="relative aspect-[16/9] bg-gray-50 overflow-hidden mb-3 shadow-sm hover:shadow-xl transition-all duration-300 rounded-sm">
        {deck.thumbnail_url ? (
          <img 
            src={deck.thumbnail_url} 
            alt={deck.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}

        {/* Currently Fundraising badge */}
        {isCurrentlyFundraising && (
          <div className="absolute top-4 left-4">
            <span className="bg-green-500 text-white text-xs font-medium px-3 py-1.5 rounded-full tracking-wide shadow-lg">
              Currently Fundraising
            </span>
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
          <span className="text-gray-400">•</span>
          <span className="tracking-wide">{formatFundingRange(deck.funding_min, deck.funding_max)}</span>
          {deck.location && (
            <>
              <span className="text-gray-400">•</span>
              <span className="tracking-wide">{deck.location}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
