import { Button } from '@/components/ui/button.jsx'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService({ onBack }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to OnlyDecks
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: October 1, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using OnlyDecks.io ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              OnlyDecks.io is a platform that allows startups to submit pitch decks for public viewing and provides investors with early access to new submissions through a paid subscription service.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Startups can submit pitch decks for free</li>
              <li>All approved decks become publicly available after 7 days</li>
              <li>Investors can subscribe for early access to new decks</li>
              <li>We reserve the right to review and approve all submissions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts and Registration</h2>
            <p className="text-gray-700 mb-4">
              To access certain features of the Service, you may be required to create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Content Submission and Ownership</h2>
            <p className="text-gray-700 mb-4">
              When you submit a pitch deck to OnlyDecks.io:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>You retain ownership of your intellectual property</li>
              <li>You grant us a license to display, distribute, and promote your content</li>
              <li>You represent that you have the right to submit the content</li>
              <li>You acknowledge that submitted content will become publicly available</li>
              <li>You understand that anyone can download and share your deck privately</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Subscription Services</h2>
            <p className="text-gray-700 mb-4">
              Our investor subscription service provides early access to new pitch decks:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Subscriptions are billed weekly at $49 USD</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You can cancel your subscription at any time</li>
              <li>No refunds are provided for partial billing periods</li>
              <li>Access continues until the end of the current billing period</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Prohibited Uses</h2>
            <p className="text-gray-700 mb-4">
              You may not use OnlyDecks.io to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Distribute malware or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to scrape or download content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-700 mb-4">
              The Service is provided "as is" without any warranties, express or implied. We do not guarantee the accuracy, completeness, or usefulness of any information on the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              In no event shall OnlyDecks.io be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@onlydecks.io<br />
                <strong>Address:</strong> OnlyDecks.io, 123 Startup Street, San Francisco, CA 94105
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
