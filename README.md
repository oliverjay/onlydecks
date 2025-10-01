# OnlyDecks.io

A minimal, elegant platform for pitch deck sharing with investor subscription model.

## 🚀 Features

- **Pitch Deck Sharing**: Startups can submit pitch decks for free
- **Investor Subscriptions**: $49/week for 7-day early access to new decks
- **Advanced Filtering**: Filter by category, funding range, location, and date
- **PDF Viewing**: Fullscreen PDF viewer with zoom, rotation, and download
- **Mobile Responsive**: Optimized for all screen sizes
- **Secure Payments**: Stripe integration for subscriptions
- **Authentication**: User accounts with Supabase Auth

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe
- **Deployment**: Vercel
- **UI Components**: shadcn/ui, Lucide Icons

## 📱 Design

- Minimal black and white aesthetic
- Clean typography and spacing
- Professional deck cards with thumbnails
- Smooth animations and transitions
- Touch-friendly mobile interface

## 🔧 Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd onlydecks
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Variables**
   Create `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Database Setup**
   - Run the SQL scripts in `/database/schema.sql` in your Supabase project
   - Optionally run `/database/sample-data.sql` for test data

5. **Start Development Server**
   ```bash
   pnpm run dev
   ```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to GitHub**
   - Push code to GitHub repository
   - Connect repository to Vercel

2. **Environment Variables**
   Set the following in Vercel dashboard:
   
   **Public Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   
   **Private Variables:**
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

3. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Custom domain: Configure in Vercel dashboard

### Supabase Configuration

1. **Database Tables**
   ```sql
   -- Run the schema.sql file in your Supabase SQL editor
   ```

2. **Storage Buckets**
   - Create `pitch-decks` bucket for PDF storage
   - Set appropriate RLS policies

3. **Authentication**
   - Configure email providers
   - Set up redirect URLs for production

### Stripe Configuration

1. **Products & Prices**
   - Create weekly subscription product ($49/week)
   - Note the price ID for environment variables

2. **Webhooks**
   - Add webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Listen for: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

## 📊 Database Schema

### Tables

- **profiles**: User profiles and subscription status
- **decks**: Pitch deck submissions
- **categories**: Deck categories (SaaS, Physical Product, etc.)
- **deck_views**: Track deck viewing analytics

### Key Features

- Row Level Security (RLS) enabled
- Automatic timestamps
- Foreign key relationships
- Indexed for performance

## 🎨 UI Components

### Core Components

- `Header`: Navigation and branding
- `FilterBar`: Advanced filtering controls
- `DeckGrid`: Responsive deck display
- `DeckCard`: Individual deck preview
- `EnhancedPDFViewer`: Fullscreen PDF viewer

### Modals

- `InvestorModal`: Subscription signup
- `SubmitDeckModal`: Deck submission form
- `AuthModal`: Login/signup

## 🔒 Security

- Environment variables for sensitive data
- Supabase RLS policies
- Stripe webhook signature verification
- Input validation and sanitization
- HTTPS enforcement

## 📈 Analytics & Monitoring

- Deck view tracking
- User engagement metrics
- Subscription conversion rates
- Error logging and monitoring

## 🎯 Business Model

- **Free Tier**: Submit decks, view public decks (7+ days old)
- **Investor Subscription**: $49/week for early access to new decks
- **Revenue Streams**: Subscription fees, potential premium features

## 🚦 Roadmap

- [ ] Advanced search functionality
- [ ] Deck analytics for submitters
- [ ] Email notifications
- [ ] API for third-party integrations
- [ ] Mobile app
- [ ] Dark mode theme

## 📞 Support

- **Email**: support@onlydecks.io
- **Documentation**: [docs.onlydecks.io](https://docs.onlydecks.io)
- **Status Page**: [status.onlydecks.io](https://status.onlydecks.io)

## 📄 Legal

- [Terms of Service](https://onlydecks.io/terms)
- [Privacy Policy](https://onlydecks.io/privacy)
- [Deck Submission Guidelines](https://onlydecks.io/guidelines)

---

Built with ❤️ for the startup ecosystem
