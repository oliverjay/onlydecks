import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { ArrowLeft, Eye, Download, Share2, ChevronLeft, ChevronRight, Loader2, MessageCircle, X, Copy, Check, Twitter, Linkedin, Mail, Send, Maximize2, Minimize2, ExternalLink } from 'lucide-react'
import { formatFundingRange, trackDeckView, getDeckViewCount, getComments, submitComment } from '../lib/database'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker - use unpkg for reliable worker access
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

export default function EnhancedPDFViewer({ deck, onClose }) {
  const [views, setViews] = useState(0)
  const [hasTracked, setHasTracked] = useState(false)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [thumbnails, setThumbnails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showHeaderShareMenu, setShowHeaderShareMenu] = useState(false)
  const [showFloatingShareMenu, setShowFloatingShareMenu] = useState(false)
  const [showCommentPanel, setShowCommentPanel] = useState(false)
  const [comment, setComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [comments, setComments] = useState([])
  const [submittingComment, setSubmittingComment] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isOverSidebar, setIsOverSidebar] = useState(false)
  const mainCanvasRef = useRef(null)
  const thumbnailRefs = useRef({})
  const sidebarRef = useRef(null)
  const viewerRef = useRef(null)

  // Prevent body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          onClose()
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        setCurrentPage(p => Math.max(1, p - 1))
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        setCurrentPage(p => Math.min(totalPages, p + 1))
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [onClose, totalPages])

  // Handle scroll to navigate pages (only when not over sidebar)
  useEffect(() => {
    let lastScrollTime = 0
    const scrollThreshold = 300 // ms between page changes

    const handleWheel = (e) => {
      // If hovering over sidebar, let it scroll naturally
      if (isOverSidebar) return
      
      e.preventDefault()
      
      const now = Date.now()
      if (now - lastScrollTime < scrollThreshold) return
      
      if (e.deltaY > 0) {
        // Scroll down - next page
        setCurrentPage(p => Math.min(totalPages, p + 1))
        lastScrollTime = now
      } else if (e.deltaY < 0) {
        // Scroll up - previous page
        setCurrentPage(p => Math.max(1, p - 1))
        lastScrollTime = now
      }
    }

    // Add wheel listener to the main content area
    window.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [totalPages, isOverSidebar])

  // Check if on mobile
  const isMobile = () => {
    return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  }

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    // On mobile, open PDF in new tab instead of fullscreen (Fullscreen API not supported)
    if (isMobile()) {
      window.open(deck.pdf_url, '_blank')
      return
    }
    
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  // Track view and fetch view count
  useEffect(() => {
    if (deck?.id && !hasTracked) {
      trackDeckView(deck.id)
      setHasTracked(true)
      getDeckViewCount(deck.id).then(count => {
        setViews(count + 1)
      })
    }
  }, [deck?.id, hasTracked])

  // Load comments
  useEffect(() => {
    if (deck?.id) {
      getComments(deck.id).then(setComments)
    }
  }, [deck?.id])

  // Load PDF document with caching
  useEffect(() => {
    if (!deck?.pdf_url) return

    const CACHE_NAME = 'onlydecks-pdf-cache'

    const loadPDF = async () => {
      setLoading(true)
      setError(null)

      try {
        let pdfData

        // Try to get from cache first
        if ('caches' in window) {
          try {
            const cache = await caches.open(CACHE_NAME)
            const cachedResponse = await cache.match(deck.pdf_url)
            
            if (cachedResponse) {
              // Use cached version
              pdfData = await cachedResponse.arrayBuffer()
              console.log('PDF loaded from cache')
            } else {
              // Fetch and cache
              const response = await fetch(deck.pdf_url)
              const responseClone = response.clone()
              pdfData = await response.arrayBuffer()
              
              // Cache for next time
              cache.put(deck.pdf_url, responseClone)
              console.log('PDF cached for future use')
            }
          } catch (cacheError) {
            console.warn('Cache error, falling back to direct load:', cacheError)
          }
        }

        // Load the PDF (from cache data or directly)
        const loadingTask = pdfData 
          ? pdfjsLib.getDocument({ data: pdfData })
          : pdfjsLib.getDocument({
              url: deck.pdf_url,
              cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/cmaps/',
              cMapPacked: true,
            })

        const pdf = await loadingTask.promise
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)

        // Generate thumbnails for all pages
        const thumbs = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 0.2 })
          
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          canvas.width = viewport.width
          canvas.height = viewport.height

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          thumbs.push({
            pageNum: i,
            dataUrl: canvas.toDataURL()
          })
        }
        setThumbnails(thumbs)
        setLoading(false)
      } catch (err) {
        console.error('Error loading PDF:', err)
        setError('Failed to load PDF')
        setLoading(false)
      }
    }

    loadPDF()
  }, [deck?.pdf_url])

  // Render current page to main canvas
  useEffect(() => {
    if (!pdfDoc || !mainCanvasRef.current || loading) return

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage)
        const canvas = mainCanvasRef.current
        if (!canvas) return
        
        const context = canvas.getContext('2d')

        // Get container dimensions with fallback
        const container = canvas.parentElement?.parentElement
        const containerWidth = container?.clientWidth || 800
        const containerHeight = container?.clientHeight || 600
        
        const viewport = page.getViewport({ scale: 1 })
        const scaleX = (containerWidth - 80) / viewport.width
        const scaleY = (containerHeight - 80) / viewport.height
        const scale = Math.min(scaleX, scaleY, 2.5) // Allow up to 2.5x for quality

        const scaledViewport = page.getViewport({ scale })
        
        // Set canvas dimensions
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height
        canvas.style.width = `${scaledViewport.width}px`
        canvas.style.height = `${scaledViewport.height}px`

        await page.render({
          canvasContext: context,
          viewport: scaledViewport
        }).promise
      } catch (err) {
        console.error('Error rendering page:', err)
      }
    }

    // Small delay to ensure container is sized
    const timer = setTimeout(renderPage, 50)
    return () => clearTimeout(timer)
  }, [pdfDoc, currentPage, loading])

  // Scroll thumbnail into view when page changes
  useEffect(() => {
    const thumbEl = thumbnailRefs.current[currentPage]
    if (thumbEl) {
      thumbEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [currentPage])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = deck.pdf_url
    link.download = `${deck.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out this pitch deck: ${deck.title}`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
    setShowHeaderShareMenu(false)
    setShowFloatingShareMenu(false)
  }

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
    setShowHeaderShareMenu(false)
    setShowFloatingShareMenu(false)
  }

  const handleShareEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(deck.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    setShowHeaderShareMenu(false)
    setShowFloatingShareMenu(false)
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (comment.trim() && authorName.trim()) {
      setSubmittingComment(true)
      try {
        const newComment = await submitComment(deck.id, authorName.trim(), comment.trim())
        setComments(prev => [newComment, ...prev])
        setComment('')
        // Keep the author name for convenience if they want to comment again
      } catch (err) {
        console.error('Error submitting comment:', err)
        alert('Failed to submit comment. Please try again.')
      } finally {
        setSubmittingComment(false)
      }
    }
  }

  return (
    <div ref={viewerRef} className={`fixed inset-0 z-50 flex flex-col ${isFullscreen ? 'bg-black' : 'bg-black'}`}>
      {/* Header - hidden in fullscreen */}
      {!isFullscreen && (
      <div className="bg-white border-b border-gray-100 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
        {/* Left side - Back button, Title, and Metadata */}
        <div className="flex items-center space-x-2 md:space-x-5 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="h-10 w-10 md:h-12 md:w-12 p-0 hover:bg-gray-50 rounded-xl flex-shrink-0 transition-all duration-200"
            title="Back (Esc)"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700" />
          </Button>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 md:gap-4 mb-0.5 md:mb-1.5">
              <h3 className="text-sm md:text-lg font-medium text-gray-900 truncate tracking-tight">{deck.title}</h3>
              {deck.expires_at && new Date(deck.expires_at) > new Date() && (
                <span className="bg-green-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs flex-shrink-0 font-medium tracking-wide">
                  Fundraising
                </span>
              )}
            </div>
            
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600 font-normal">
              {deck.categories && (
                <span className="tracking-wide">{deck.categories.name}</span>
              )}
              {deck.categories && (deck.funding_min || deck.location) && (
                <span className="text-gray-400">•</span>
              )}
              {deck.funding_min && deck.funding_max && (
                <span className="tracking-wide">{formatFundingRange(deck.funding_min, deck.funding_max)}</span>
              )}
              {deck.funding_min && deck.location && (
                <span className="text-gray-400">•</span>
              )}
              {deck.location && (
                <span className="tracking-wide">{deck.location}</span>
              )}
            </div>
            {/* Mobile metadata - simplified */}
            <div className="flex md:hidden items-center text-xs text-gray-500 font-normal">
              {deck.funding_min && deck.funding_max && (
                <span>{formatFundingRange(deck.funding_min, deck.funding_max)}</span>
              )}
              {deck.funding_min && deck.location && (
                <span className="mx-1.5">•</span>
              )}
              {deck.location && (
                <span>{deck.location}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Right side - Views, Download, Share */}
        <div className="flex items-center space-x-0.5 md:space-x-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            className="h-9 md:h-11 px-2 md:px-4 hover:bg-gray-50 rounded-lg md:rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-200"
            title="Views"
          >
            <Eye className="h-4 w-4 md:h-5 md:w-5 md:mr-2" />
            <span className="text-xs md:text-sm font-medium tracking-wide ml-1">{views}</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleDownload}
            className="h-9 w-9 md:h-11 md:w-11 hover:bg-gray-50 rounded-lg md:rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-200"
            title="Download PDF"
          >
            <Download className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              onClick={() => setShowHeaderShareMenu(!showHeaderShareMenu)}
              className="h-9 w-9 md:h-11 md:w-11 hover:bg-gray-50 rounded-lg md:rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-200"
              title="Share"
            >
              <Share2 className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            
            {/* Share Menu Dropdown */}
            {showHeaderShareMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[280px] md:min-w-[280px] z-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Share this deck</h4>
                  <button 
                    onClick={() => setShowHeaderShareMenu(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Copy Link */}
                <div className="flex items-center bg-gray-50 rounded-xl p-3 mb-4">
                  <input 
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="ml-2 flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                
                {/* Social Share Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleShareTwitter}
                    className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-xl py-2.5 px-4 hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </button>
                  <button
                    onClick={handleShareLinkedIn}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0077B5] text-white rounded-xl py-2.5 px-4 hover:bg-[#006699] transition-colors text-sm font-medium"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </button>
                  <button
                    onClick={handleShareEmail}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 rounded-xl py-2.5 px-4 hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnail Sidebar - hidden on mobile and in fullscreen */}
        {!isFullscreen && (
        <div 
          ref={sidebarRef}
          className="hidden md:block w-48 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0 p-3 space-y-4"
          onMouseEnter={() => setIsOverSidebar(true)}
          onMouseLeave={() => setIsOverSidebar(false)}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <span className="text-xs">Loading pages...</span>
            </div>
          ) : (
            thumbnails.map((thumb) => (
              <button
                key={thumb.pageNum}
                ref={el => thumbnailRefs.current[thumb.pageNum] = el}
                onClick={() => setCurrentPage(thumb.pageNum)}
                className={`w-full rounded-sm overflow-hidden transition-all duration-200 border ${
                  currentPage === thumb.pageNum 
                    ? 'ring-2 ring-black ring-offset-2 ring-offset-white border-black' 
                    : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                }`}
              >
                <img 
                  src={thumb.dataUrl} 
                  alt={`Page ${thumb.pageNum}`}
                  className="w-full h-auto"
                />
                <div className={`text-center py-1.5 text-xs bg-gray-50 border-t border-gray-100 ${
                  currentPage === thumb.pageNum ? 'text-black font-semibold' : 'text-gray-500'
                }`}>
                  {thumb.pageNum}
                </div>
              </button>
            ))
          )}
        </div>
        )}

        {/* Main Slide View */}
        <div className={`flex-1 flex items-center justify-center overflow-auto relative ${isFullscreen ? 'bg-black p-0' : 'bg-gray-100 p-2 md:p-4'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin mb-4" />
              <p className="font-medium text-sm md:text-base">Loading presentation...</p>
            </div>
          ) : error ? (
            <div className="text-center text-gray-500 px-4">
              <p className="text-lg md:text-xl font-medium mb-2">Unable to load PDF</p>
              <p className="text-sm mb-4">{error}</p>
              <Button onClick={onClose} variant="outline">Go Back</Button>
            </div>
          ) : (
            <>
              <div className={`${isFullscreen ? '' : 'bg-white shadow-2xl rounded-sm'} overflow-hidden max-w-full`}>
                <canvas ref={mainCanvasRef} className="block max-w-full h-auto" />
              </div>
              
              {/* Navigation zones - click left/right to navigate (both mobile and fullscreen) */}
              {(isFullscreen || window.innerWidth < 768) && (
                <>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="absolute left-0 top-0 w-1/4 h-full cursor-w-resize opacity-0 active:opacity-100 md:hover:opacity-100 transition-opacity flex items-center justify-start pl-2 md:pl-8"
                    disabled={currentPage === 1}
                  >
                    <div className={`bg-black/30 md:bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 ${currentPage === 1 ? 'opacity-30' : ''}`}>
                      <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="absolute right-0 top-0 w-1/4 h-full cursor-e-resize opacity-0 active:opacity-100 md:hover:opacity-100 transition-opacity flex items-center justify-end pr-2 md:pr-8"
                    disabled={currentPage === totalPages}
                  >
                    <div className={`bg-black/30 md:bg-white/20 backdrop-blur-sm rounded-full p-2 md:p-3 ${currentPage === totalPages ? 'opacity-30' : ''}`}>
                      <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Action Buttons - Bottom Center */}
      {isFullscreen ? (
        /* Minimal UI in fullscreen - just exit button and page indicator */
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Exit fullscreen button */}
            <Button 
              onClick={toggleFullscreen}
              className="bg-white/90 hover:bg-white text-gray-900 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all shadow-lg"
            >
              <Minimize2 className="h-4 w-4 mr-1 md:mr-2" />
              Exit
            </Button>
            {/* Page indicator */}
            <div className="bg-black/60 backdrop-blur-md text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium">
              {currentPage} / {totalPages}
            </div>
          </div>
        </div>
      ) : (
      <>
        {/* Mobile Bottom Bar */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 safe-area-inset-bottom">
          <div className="flex items-center justify-between">
            {/* Left - Pagination */}
            <div className="flex items-center bg-gray-100 rounded-lg px-1 py-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 flex items-center justify-center text-gray-700 disabled:opacity-30 rounded-md active:bg-gray-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[50px] text-center text-gray-900 text-xs font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 flex items-center justify-center text-gray-700 disabled:opacity-30 rounded-md active:bg-gray-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            {/* Right - Actions */}
            <div className="flex items-center gap-1">
              <button 
                onClick={handleDownload}
                className="h-10 w-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Download PDF"
              >
                <Download className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setShowFloatingShareMenu(!showFloatingShareMenu)}
                className="h-10 w-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setShowCommentPanel(!showCommentPanel)}
                className="h-10 w-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Comment"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={toggleFullscreen}
                className="h-10 w-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Open PDF"
              >
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Floating Bar */}
        <div className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 ml-24">
          <div className="flex items-center bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl px-2 py-2 space-x-1 border border-gray-200/50">
            <Button 
              variant="ghost" 
              onClick={handleDownload}
              className="h-11 px-5 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200"
            >
              <Download className="h-5 w-5 mr-2.5" />
              <span className="text-sm font-medium tracking-wide">Download</span>
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="relative">
              <Button 
                variant="ghost" 
                onClick={() => setShowFloatingShareMenu(!showFloatingShareMenu)}
                className="h-11 px-5 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200"
              >
                <Share2 className="h-5 w-5 mr-2.5" />
                <span className="text-sm font-medium tracking-wide">Share</span>
              </Button>
              
              {/* Share Menu */}
              {showFloatingShareMenu && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 min-w-[280px]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Share this deck</h4>
                    <button 
                      onClick={() => setShowFloatingShareMenu(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Copy Link */}
                  <div className="flex items-center bg-gray-50 rounded-xl p-3 mb-4">
                    <input 
                      type="text" 
                      value={shareUrl} 
                      readOnly 
                      className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
                    />
                    <button 
                      onClick={handleCopyLink}
                      className="ml-2 flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-1.5">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  
                  {/* Social Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={handleShareTwitter}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium min-w-[90px]"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </button>
                    <button 
                      onClick={handleShareLinkedIn}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#0077B5] text-white rounded-xl hover:bg-[#006699] transition-colors text-sm font-medium min-w-[90px]"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </button>
                    <button 
                      onClick={handleShareEmail}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium min-w-[90px]"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <Button 
              variant="ghost" 
              onClick={() => setShowCommentPanel(!showCommentPanel)}
              className="h-11 px-5 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200"
            >
              <MessageCircle className="h-5 w-5 mr-2.5" />
              <span className="text-sm font-medium tracking-wide">Comment</span>
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <Button 
              variant="ghost" 
              onClick={toggleFullscreen}
              className="h-11 px-5 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </>
      )}

      {/* Mobile Share Menu - positioned above bottom bar */}
      {showFloatingShareMenu && !isFullscreen && (
        <div className="md:hidden fixed bottom-16 left-2 right-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Share this deck</h4>
            <button 
              onClick={() => setShowFloatingShareMenu(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Copy Link */}
          <div className="flex items-center bg-gray-50 rounded-xl p-3 mb-4">
            <input 
              type="text" 
              value={shareUrl} 
              readOnly 
              className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
            />
            <button 
              onClick={handleCopyLink}
              className="ml-2 flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1.5">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          
          {/* Social Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={handleShareTwitter}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-black text-white rounded-xl text-sm font-medium"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </button>
            <button 
              onClick={handleShareLinkedIn}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-[#0077B5] text-white rounded-xl text-sm font-medium"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </button>
            <button 
              onClick={handleShareEmail}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
          </div>
        </div>
      )}

      {/* Comment Panel - hidden in fullscreen */}
      {showCommentPanel && !isFullscreen && (
        <div className="fixed md:absolute bottom-16 md:bottom-24 left-2 right-2 md:left-1/2 md:right-auto md:-translate-x-1/2 md:ml-24 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 md:p-5 md:w-[420px] max-h-[60vh] md:max-h-[70vh] overflow-hidden flex flex-col z-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Comments {comments.length > 0 && `(${comments.length})`}</h4>
            <button 
              onClick={() => setShowCommentPanel(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-4">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What do you think about this pitch deck?"
              className="w-full h-20 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <div className="flex justify-end mt-3">
              <Button 
                type="submit"
                disabled={!comment.trim() || !authorName.trim() || submittingComment}
                className="bg-black text-white hover:bg-gray-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {submittingComment ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>

          {/* Existing Comments */}
          {comments.length > 0 && (
            <div className="border-t border-gray-100 pt-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 text-sm">{c.author_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {comments.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first!</p>
          )}
        </div>
      )}

      {/* Bottom Right - Pagination - hidden in fullscreen and on mobile (mobile has its own) */}
      {totalPages > 0 && !isFullscreen && (
        <div className="hidden md:block absolute bottom-8 right-6">
          <div className="flex items-center bg-white shadow-lg border border-gray-200 rounded-xl px-2 py-1.5">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[60px] text-center text-gray-900 text-sm font-medium tracking-wide">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
