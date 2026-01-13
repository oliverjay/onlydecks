import { Button } from '@/components/ui/button.jsx'
import { ArrowLeft, FileText, CheckCircle, XCircle, Lightbulb } from 'lucide-react'

export default function Guidelines({ onBack }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-black font-normal text-sm tracking-wide transition-all duration-200 hover:bg-gray-50 rounded-lg px-4 py-2 -ml-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-3 mb-8">
          <FileText className="h-8 w-8 text-gray-900" />
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Pitch Deck Guidelines</h1>
        </div>
        
        <p className="text-gray-600 mb-12 text-lg font-normal leading-relaxed">
          Follow these guidelines to create a pitch deck that gets noticed by investors. 
          A well-structured deck significantly increases your chances of getting funded.
        </p>

        {/* What We're Looking For */}
        <section className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">What We're Looking For</h2>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-6">
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Clear problem statement</strong> — What problem are you solving?</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Compelling solution</strong> — How does your product/service solve it?</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Market opportunity</strong> — How big is the addressable market?</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Business model</strong> — How do you make money?</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Traction</strong> — What progress have you made so far?</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Team</strong> — Who are the founders and key team members?</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>The Ask</strong> — How much are you raising and what will you use it for?</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Contact information</strong> — Email, phone, or LinkedIn clearly visible</span>
              </li>
            </ul>
          </div>
        </section>

        {/* What to Avoid */}
        <section className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <XCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">What to Avoid</h2>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-6">
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Too many slides</strong> — Keep it to 10-15 slides maximum</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Walls of text</strong> — Use bullet points and visuals instead</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>No contact info</strong> — Investors need to be able to reach you</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Unrealistic projections</strong> — Be ambitious but credible</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Poor design quality</strong> — First impressions matter</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-red-600 font-bold">✗</span>
                <span><strong>Confidential information</strong> — Only share what you're comfortable making public</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Pro Tips */}
        <section className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900">Pro Tips</h2>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="text-amber-600 font-bold">★</span>
                <span><strong>Tell a story</strong> — The best decks take investors on a journey</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-amber-600 font-bold">★</span>
                <span><strong>Use high-quality images</strong> — Product screenshots, team photos, etc.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-amber-600 font-bold">★</span>
                <span><strong>Include social proof</strong> — Press mentions, customer logos, testimonials</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-amber-600 font-bold">★</span>
                <span><strong>Show your competitive advantage</strong> — What makes you different?</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-amber-600 font-bold">★</span>
                <span><strong>Be specific with numbers</strong> — Revenue, users, growth rate, etc.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Technical Requirements */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Technical Requirements</h2>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6">
            <ul className="space-y-3 text-gray-700">
              <li>• <strong>Format:</strong> PDF only</li>
              <li>• <strong>File size:</strong> Maximum 50MB</li>
              <li>• <strong>Recommended slides:</strong> 10-15 slides</li>
              <li>• <strong>Aspect ratio:</strong> 16:9 (widescreen) recommended</li>
              <li>• <strong>Language:</strong> English</li>
            </ul>
          </div>
        </section>

        {/* Review Process */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Our Review Process</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium flex-shrink-0">1</div>
              <div>
                <h3 className="font-medium text-gray-900">Submit your deck</h3>
                <p className="text-gray-600 text-sm">Upload your PDF and fill in the basic details</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium flex-shrink-0">2</div>
              <div>
                <h3 className="font-medium text-gray-900">We review (1-2 days)</h3>
                <p className="text-gray-600 text-sm">Our team checks the deck meets our guidelines</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium flex-shrink-0">3</div>
              <div>
                <h3 className="font-medium text-gray-900">Published</h3>
                <p className="text-gray-600 text-sm">Your deck goes live and investors can view it</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-medium flex-shrink-0">4</div>
              <div>
                <h3 className="font-medium text-gray-900">Get contacted</h3>
                <p className="text-gray-600 text-sm">Interested investors reach out using your contact info</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-black text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-3">Ready to submit your deck?</h2>
          <p className="text-gray-400 mb-6">Join hundreds of startups getting discovered by investors</p>
          <Button 
            onClick={onBack}
            className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-lg font-medium"
          >
            Back to OnlyDecks
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} OnlyDecks. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
