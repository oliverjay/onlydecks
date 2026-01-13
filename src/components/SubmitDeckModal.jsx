import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { X, Upload, AlertCircle, Loader2, Check } from 'lucide-react'
import { uploadPDF, uploadThumbnail, submitDeck } from '../lib/database'
import { supabase } from '../lib/supabase'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// Generate thumbnail from PDF first page
async function generateThumbnailFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)
  
  // Render at a good size for thumbnails (16:9 aspect ratio target)
  const viewport = page.getViewport({ scale: 1 })
  const scale = 800 / viewport.width // Target 800px width
  const scaledViewport = page.getViewport({ scale })
  
  const canvas = document.createElement('canvas')
  canvas.width = scaledViewport.width
  canvas.height = scaledViewport.height
  
  const context = canvas.getContext('2d')
  await page.render({
    canvasContext: context,
    viewport: scaledViewport
  }).promise
  
  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png', 0.9)
  })
}

export default function SubmitDeckModal({ isOpen, onClose, categories, locations, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    email: '',
    category: '',
    fundingRange: '',
    location: '',
    fundraisingEndDate: '',
    file: null
  })
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  if (!isOpen) return null

  const getFundingValues = (range) => {
    const ranges = {
      'Under $50K': { min: 0, max: 5000000 },
      '$50K — $250K': { min: 5000000, max: 25000000 },
      '$250K — $1M': { min: 25000000, max: 100000000 },
      '$1M — $5M': { min: 100000000, max: 500000000 },
      '$5M — $10M': { min: 500000000, max: 1000000000 },
      '$10M+': { min: 1000000000, max: 10000000000 }
    }
    return ranges[range] || { min: null, max: null }
  }

  const getFundraisingEndDate = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toISOString()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    // Basic validation
    if (!formData.title || !formData.email || !formData.location || !formData.file) {
      setError('Please fill in all required fields and upload a PDF')
      return
    }
    
    setUploading(true)
    
    try {
      // Upload PDF
      const { url: pdfUrl } = await uploadPDF(formData.file)
      
      // Generate and upload thumbnail from PDF first page
      let thumbnailUrl = null
      try {
        const thumbnailBlob = await generateThumbnailFromPDF(formData.file)
        const { url } = await uploadThumbnail(thumbnailBlob, formData.file.name)
        thumbnailUrl = url
      } catch (thumbErr) {
        console.warn('Could not generate thumbnail:', thumbErr)
        // Continue without thumbnail
      }
      
      // Get category ID
      let categoryId = null
      if (formData.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', formData.category)
          .single()
        categoryId = categoryData?.id
      }
      
      // Get funding values
      const funding = getFundingValues(formData.fundingRange)
      
      // Get location label
      const locationData = locations?.find(l => l.value === formData.location)
      const locationLabel = locationData?.label || formData.location
      
      // Submit deck
      await submitDeck({
        title: formData.title,
        contact_email: formData.email,
        category_id: categoryId,
        funding_min: funding.min,
        funding_max: funding.max,
        location: locationLabel,
        pdf_url: pdfUrl,
        thumbnail_url: thumbnailUrl,
        expires_at: getFundraisingEndDate(formData.fundraisingEndDate)
      })
      
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setTermsAccepted(false)
        setFormData({
          title: '',
          email: '',
          category: '',
          fundingRange: '',
          location: '',
          fundraisingEndDate: '',
          file: null
        })
        // Notify parent to refresh decks
        if (onSuccess) onSuccess()
      }, 2000)
      
    } catch (err) {
      console.error('Error submitting deck:', err)
      setError('Failed to submit deck. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, file }))
      setError(null)
    } else {
      setError('Please upload a PDF file')
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
              <h2 className="text-xl font-normal text-gray-900 tracking-wide mb-2">Deck Submitted!</h2>
              <p className="text-gray-600 font-normal">We'll review your deck and publish it shortly.</p>
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
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-normal text-gray-900 tracking-wide">Upload Deck PDF</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-50 rounded-lg">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Important Notice */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Important: Include Your Contact Details</h3>
                <p className="text-sm text-gray-600 font-normal leading-relaxed">
                  Please ensure your contact information (email, phone, or LinkedIn) is clearly visible within your pitch deck. 
                  Investors will use these details to reach out to you directly.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-700 font-normal">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload */}
            <div>
              <p className="text-gray-700 mb-2 font-normal">
                Upload your company pitch deck PDF for free.
              </p>
              <p className="text-sm text-gray-500 mb-6 font-normal">
                TIP: Read our{' '}
                <a 
                  href="/guidelines" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline cursor-pointer hover:text-gray-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  guides
                </a>{' '}
                on how to design your deck
              </p>
              
              <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                formData.file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <div className={`mb-4 ${formData.file ? 'text-green-500' : 'text-gray-300'}`}>
                    {formData.file ? (
                      <Check className="mx-auto h-12 w-12" strokeWidth={1} />
                    ) : (
                      <Upload className="mx-auto h-12 w-12" strokeWidth={1} />
                    )}
                  </div>
                  <p className={`font-normal ${formData.file ? 'text-green-700' : 'text-gray-600'}`}>
                    {formData.file ? formData.file.name : 'Click to upload PDF'}
                  </p>
                </label>
              </div>
            </div>

            {/* Company Details */}
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-3 tracking-wide">
                Company Name *
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-normal"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-3 tracking-wide">
                Your Email *
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-normal"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-2 font-normal">We'll use this to contact you about your submission</p>
            </div>

            {/* Location Selection */}
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-6 tracking-wide">Choose Location *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {locations && locations.map((location) => (
                  <button
                    key={location.value}
                    type="button"
                    className={`p-4 border rounded-lg text-sm font-normal tracking-wide transition-all duration-200 ${
                      formData.location === location.value
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, location: location.value }))}
                  >
                    {location.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-6 tracking-wide">Choose Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id || category.slug}
                    type="button"
                    className={`p-4 border rounded-lg text-sm font-normal tracking-wide transition-all duration-200 ${
                      formData.category === category.slug
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, category: category.slug }))}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Funding Required */}
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-6 tracking-wide">Funding Required</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Under $50K',
                  '$50K — $250K',
                  '$250K — $1M',
                  '$1M — $5M',
                  '$5M — $10M',
                  '$10M+'
                ].map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={`p-4 border rounded-lg text-sm font-normal tracking-wide transition-all duration-200 ${
                      formData.fundingRange === range
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, fundingRange: range }))}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Fundraising End Date */}
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-3 tracking-wide">Fundraising End Date</h3>
              <p className="text-sm text-gray-500 mb-6 font-normal leading-relaxed">
                When does your fundraising round end? Decks with active fundraising will be highlighted to investors.
                Leave blank if there's no specific end date.
              </p>
              <input
                type="date"
                className="w-full max-w-xs border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-normal"
                value={formData.fundraisingEndDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, fundraisingEndDate: e.target.value }))}
              />
            </div>

            {/* What happens next */}
            <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl">
              <h3 className="text-lg font-normal text-gray-900 mb-4 tracking-wide">What happens next?</h3>
              <ol className="text-sm text-gray-600 space-y-2 font-normal">
                <li>1) We'll review your deck to make sure it meets our{' '}
                  <a 
                    href="/guidelines" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline cursor-pointer hover:text-gray-800 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    guidelines
                  </a>{' '}
                  (1-2 days)
                </li>
                <li>2) Once approved, your deck will be publicly visible to all visitors</li>
                <li>3) Interested investors will reach out to you directly using the contact info in your deck</li>
              </ol>
            </div>

            {/* Terms and Submit */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <button
                  type="button"
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className="relative flex-shrink-0 mt-0.5 group"
                >
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="sr-only" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required 
                  />
                  <div className={`w-7 h-7 border-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    termsAccepted 
                      ? 'bg-black border-black' 
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    <Check 
                      className={`w-4 h-4 text-white transition-all duration-200 ${
                        termsAccepted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                      strokeWidth={3}
                    />
                  </div>
                </button>
                <span className="text-sm text-gray-600 font-normal leading-relaxed">
                  Please read and agree our{' '}
                  <a 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-800 transition-colors"
                  >
                    general terms
                  </a>{' '}
                  before pressing 'Upload'
                </span>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg font-normal tracking-wide border-gray-200 hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-normal tracking-wide transition-all duration-200 hover:shadow-lg"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
