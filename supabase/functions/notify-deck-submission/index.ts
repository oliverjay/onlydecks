// Supabase Edge Function: Notify on Deck Submission
// This function sends an email notification when a new deck is submitted

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const NOTIFY_EMAIL = "oli@zoo.studio"

// Supabase project details (these get set automatically in Edge Functions)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface DeckPayload {
  type: 'INSERT'
  table: string
  record: {
    id: string
    title: string
    contact_email: string
    location: string
    funding_min: number
    funding_max: number
    pdf_url: string
    created_at: string
    status: string
  }
  schema: string
}

serve(async (req) => {
  try {
    const payload: DeckPayload = await req.json()
    
    // Only process INSERT events
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Not an INSERT event' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const deck = payload.record
    
    // Format funding range
    const formatFunding = (min: number, max: number) => {
      const formatNum = (n: number) => {
        if (n >= 10000000) return `$${(n / 100 / 1000000).toFixed(0)}M+`
        if (n >= 1000000) return `$${(n / 100 / 1000000).toFixed(1)}M`
        if (n >= 1000) return `$${(n / 100 / 1000).toFixed(0)}K`
        return `$${n / 100}`
      }
      return `${formatNum(min)} - ${formatNum(max)}`
    }

    const fundingRange = formatFunding(deck.funding_min, deck.funding_max)
    const submittedAt = new Date(deck.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Email content
    const subject = `🚀 New Deck Submitted: ${deck.title}`
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #111; font-size: 24px; margin-bottom: 20px;">New Deck Submission</h1>
        
        <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
          <h2 style="color: #111; font-size: 20px; margin: 0 0 16px 0;">${deck.title}</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px;">Contact Email</td>
              <td style="padding: 8px 0; color: #111;"><a href="mailto:${deck.contact_email}" style="color: #111;">${deck.contact_email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Location</td>
              <td style="padding: 8px 0; color: #111;">${deck.location}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Funding Needed</td>
              <td style="padding: 8px 0; color: #111;">${fundingRange}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Submitted</td>
              <td style="padding: 8px 0; color: #111;">${submittedAt}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Status</td>
              <td style="padding: 8px 0;">
                <span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 999px; font-size: 14px;">
                  ${deck.status || 'pending'}
                </span>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <a href="${deck.pdf_url}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            View PDF
          </a>
          <a href="https://supabase.com/dashboard/project/txlnensotksykgwrxdrw/editor" style="display: inline-block; background: #f3f4f6; color: #111; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-left: 8px;">
            Open Supabase
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
          OnlyDecks Admin Notification
        </p>
      </div>
    `

    // Send email using Supabase's built-in email hook
    // You'll need to configure this in Supabase Dashboard > Authentication > Email Templates
    // Or use the Resend integration
    
    // Using Resend (Supabase's recommended email provider)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'OnlyDecks <notifications@onlydecks.io>',
          to: [NOTIFY_EMAIL],
          subject: subject,
          html: htmlBody
        })
      })

      if (!emailResponse.ok) {
        const error = await emailResponse.text()
        console.error('Email send failed:', error)
        throw new Error(`Email failed: ${error}`)
      }

      console.log('Email sent successfully for deck:', deck.title)
    } else {
      // Fallback: Log the notification (useful for testing)
      console.log('=== DECK SUBMISSION NOTIFICATION ===')
      console.log('To:', NOTIFY_EMAIL)
      console.log('Subject:', subject)
      console.log('Deck:', deck.title)
      console.log('Contact:', deck.contact_email)
      console.log('No RESEND_API_KEY set - email not sent')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification processed for deck: ${deck.title}` 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})
