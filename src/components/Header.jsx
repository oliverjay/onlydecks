import { Button } from '@/components/ui/button.jsx'

export default function Header({ onInvestorClick, onSubmitClick }) {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
        <div className="flex items-center h-20">
          {/* Left side - Fixed width for perfect centering */}
          <div className="flex-1 flex justify-start">
            <Button 
              variant="ghost" 
              className="text-gray-600 hover:text-black font-normal text-sm tracking-wide transition-all duration-200 hover:bg-gray-50 rounded-lg px-6 py-3"
              onClick={onInvestorClick}
            >
              Investors
            </Button>
          </div>

          {/* Center - Logo - Perfectly centered */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-normal text-black tracking-tight">
              OnlyDecks
            </h1>
          </div>

          {/* Right side - Fixed width matching left for perfect centering */}
          <div className="flex-1 flex justify-end items-center space-x-4">
            <span className="text-sm text-gray-500 hidden sm:inline font-normal">
              Raising money?
            </span>
            <Button 
              className="bg-black text-white hover:bg-gray-900 px-8 py-3 rounded-lg font-normal text-sm tracking-wide transition-all duration-200 hover:shadow-lg"
              onClick={onSubmitClick}
            >
              Submit a Deck
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
