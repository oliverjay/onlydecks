// Supabase Edge Function: Notify on Newsletter Signup
// This function sends an email notification when someone subscribes to the newsletter

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const NOTIFY_EMAIL = "oli@zoo.studio"

interface NewsletterPayload {
  type: 'INSERT'
  table: string
  record: {
    id: string
    email: string
    frequency: string
    created_at: string
  }
  schema: string
}

serve(async (req) => {
  try {
    const payload: NewsletterPayload = await req.json()
    
    // Only process INSERT events
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Not an INSERT event' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const subscriber = payload.record
    
    const subscribedAt = new Date(subscriber.created_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Email content
    const subject = `📬 New Newsletter Subscriber`
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #111; font-size: 24px; margin-bottom: 20px;">New Newsletter Signup</h1>
        
        <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 120px;">Email</td>
              <td style="padding: 8px 0; color: #111; font-weight: 500;">
                <a href="mailto:${subscriber.email}" style="color: #111;">${subscriber.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Frequency</td>
              <td style="padding: 8px 0; color: #111; text-transform: capitalize;">${subscriber.frequency || 'weekly'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Subscribed</td>
              <td style="padding: 8px 0; color: #111;">${subscribedAt}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <a href="https://supabase.com/dashboard/project/txlnensotksykgwrxdrw/editor" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Open Supabase
          </a>
        </div>
        
        <p style="color: #9ca3af; font-size: 14px; margin: 0;">
          OnlyDecks Admin Notification
        </p>
      </div>
    `

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

      console.log('Email sent successfully for subscriber:', subscriber.email)
    } else {
      // Fallback: Log the notification (useful for testing)
      console.log('=== NEWSLETTER SIGNUP NOTIFICATION ===')
      console.log('To:', NOTIFY_EMAIL)
      console.log('Subject:', subject)
      console.log('Subscriber:', subscriber.email)
      console.log('Frequency:', subscriber.frequency)
      console.log('No RESEND_API_KEY set - email not sent')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification processed for subscriber: ${subscriber.email}` 
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
