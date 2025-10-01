import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { X, Download, RotateCw } from 'lucide-react'

export default function EnhancedPDFViewer({ deck, onClose }) {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [onClose])

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = deck.pdf_url
    link.download = `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetView = () => {
    setRotation(0)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{deck.title}</h3>
          {deck.categories && (
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600 flex-shrink-0">
              {deck.categories.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={handleRotate} title="Rotate">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={resetView} title="Reset View">
            <span className="text-xs">Reset</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} title="Download PDF">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} title="Close (ESC)">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="max-w-5xl mx-auto">
          {deck.pdf_url ? (
            <div className="bg-white shadow-2xl mx-auto rounded-lg overflow-hidden">
              <div 
                className="transition-transform duration-200 ease-in-out"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <iframe
                  src={`${deck.pdf_url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                  className="w-full h-[800px] border-0"
                  title={deck.title}
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center shadow-lg">
              <div className="text-gray-400 mb-6">
                <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">PDF not available</h3>
              <p className="text-gray-500 mb-6">This deck's PDF is currently unavailable or still being processed.</p>
              <Button onClick={onClose} variant="outline">
                Go Back
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            {deck.location && (
              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{deck.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                Submitted {new Date(deck.submitted_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            {deck.funding_min && deck.funding_max && (
              <div className="flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>
                  ${(deck.funding_min / 100000000).toFixed(1)}M — ${(deck.funding_max / 100000000).toFixed(1)}M
                </span>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-400 hidden sm:block">
            Use +/- to zoom • F for fullscreen • ESC to close
          </div>
        </div>
      </div>
    </div>
  )
}
