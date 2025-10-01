import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react'

export default function PDFViewer({ deck, onClose }) {
  const [zoom, setZoom] = useState(1)

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = () => {
    // Create a temporary link to download the PDF
    const link = document.createElement('a')
    link.href = deck.pdf_url
    link.download = `${deck.title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900 truncate">{deck.title}</h3>
          {deck.categories && (
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
              {deck.categories.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          {deck.pdf_url ? (
            <div 
              className="bg-white shadow-lg mx-auto"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
              <iframe
                src={`${deck.pdf_url}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-[800px] border-0"
                title={deck.title}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">PDF not available</h3>
              <p className="text-gray-500">This deck's PDF is currently unavailable.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {deck.location && <span>{deck.location}</span>}
            <span>•</span>
            <span>
              Submitted {new Date(deck.submitted_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          
          <div className="text-xs text-gray-400">
            Press ESC to close
          </div>
        </div>
      </div>
    </div>
  )
}
