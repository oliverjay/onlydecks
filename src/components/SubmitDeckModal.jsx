import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { X, Upload, AlertCircle } from 'lucide-react'

export default function SubmitDeckModal({ isOpen, onClose, categories }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    fundingMin: '',
    fundingMax: '',
    location: '',
    expiry: '90',
    file: null
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement deck submission
    console.log('Submitting deck:', formData)
    onClose()
  }

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload */}
            <div>
              <p className="text-gray-600 mb-2 font-normal">
                Upload your company pitch deck PDF for free.
              </p>
              <p className="text-sm text-gray-400 mb-6 font-normal">
                TIP: Read our <span className="underline cursor-pointer hover:text-gray-600 transition-colors">guides</span> on how to design your deck
              </p>
              
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-gray-300 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <div className="text-gray-300 mb-4">
                    <Upload className="mx-auto h-12 w-12" strokeWidth={1} />
                  </div>
                  <p className="text-gray-600 font-normal">
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

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-3 tracking-wide">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-normal"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Category Selection */}
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-6 tracking-wide">Choose Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
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

            {/* Expiry */}
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-3 tracking-wide">Expiry</h3>
              <p className="text-sm text-gray-500 mb-6 font-normal leading-relaxed">
                You can choose when your deck will be removed from OnlyDecks. If you want it removing sooner, please{' '}
                <span className="underline cursor-pointer hover:text-gray-700 transition-colors">contact us</span>. Please note once your deck is uploaded, anyone can download and share your deck privately.
              </p>
              <div className="flex gap-3">
                {[
                  { label: '30 days', value: '30' },
                  { label: '90 days', value: '90' },
                  { label: 'Never', value: 'never' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`px-6 py-3 border rounded-lg text-sm font-normal tracking-wide transition-all duration-200 ${
                      formData.expiry === option.value
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, expiry: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl">
              <h3 className="text-lg font-normal text-gray-900 mb-4 tracking-wide">What happens next?</h3>
              <ol className="text-sm text-gray-600 space-y-2 font-normal">
                <li>1) We'll review your deck to make sure it meets our <span className="underline cursor-pointer hover:text-gray-800 transition-colors">guidelines</span> (1-2 days)</li>
                <li>2) Your deck will go to our PRO investors for the first 7 days</li>
                <li>3) Finally your deck go Public to all visitors for maximum exposure.</li>
              </ol>
            </div>

            {/* Terms and Submit */}
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <input type="checkbox" id="terms" className="mt-1.5" required />
                <label htmlFor="terms" className="text-sm text-gray-600 font-normal">
                  Please read and agree our <span className="underline cursor-pointer hover:text-gray-800 transition-colors">general terms</span> before pressing 'Upload'
                </label>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg font-normal tracking-wide border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-normal tracking-wide transition-all duration-200 hover:shadow-lg"
                >
                  Upload
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
