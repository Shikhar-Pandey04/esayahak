# Buyer Lead Intake System

A comprehensive buyer lead management application built with Next.js 15, TypeScript, and modern web technologies. This system allows real estate professionals to manage buyer leads with full CRUD operations, authentication, CSV import/export, and advanced filtering capabilities.

## 🚀 Features

### Core Functionality
- **Buyer Lead Management**: Complete CRUD operations for buyer leads
- **Authentication**: Magic link email authentication via NextAuth
- **Data Validation**: Comprehensive form validation with Zod schemas
- **Search & Filtering**: Advanced filtering with pagination and sorting
- **CSV Operations**: Import/export buyer data with validation
- **Change History**: Track all modifications with detailed history
- **Ownership Control**: Users can only access their own buyer leads
- **Concurrency Control**: Prevents simultaneous edits with conflict detection

### Technical Features
- **Rate Limiting**: API protection with configurable limits
- **Error Boundaries**: Graceful error handling throughout the app
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Type Safety**: Full TypeScript implementation
- **Testing**: Unit tests for critical functionality

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Authentication**: NextAuth.js with email provider
- **Validation**: Zod schemas
- **Database**: JSON file-based storage (development)
- **Testing**: Jest with Testing Library
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Email server configuration (for magic link auth)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd esayahak
npm install
```

### 2. Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
cp env.example .env.local
```

Configure the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email Server (for magic link authentication)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Database (JSON file path)
DATABASE_PATH=./data
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 📖 Usage Guide

### Authentication
1. Navigate to the sign-in page
2. Enter your email address
3. Check your email for the magic link
4. Click the link to authenticate

### Managing Buyer Leads

#### Creating a New Buyer
1. Go to "Add New Buyer" from the navigation
2. Fill in the required information:
   - Full Name (required)
   - Phone (required, 10-15 digits)
   - City (dropdown selection)
   - Property Type (dropdown)
   - BHK (required for Apartment/Villa)
   - Purpose (Buy/Rent)
   - Budget range (optional)
   - Timeline and Source
   - Notes and tags (optional)
3. Submit the form

#### Viewing and Editing Buyers
1. Navigate to "Buyers" to see the list
2. Use filters to search by city, property type, status, etc.
3. Click on a buyer to view details and history
4. Click "Edit" to modify buyer information
5. View change history at the bottom of the detail page

#### CSV Import/Export
1. **Import**: Use the "Import CSV" button on the buyers list
   - Download the sample CSV template
   - Fill in buyer data following the format
   - Upload and review validation results
   - Maximum 200 rows per import

2. **Export**: Click "Export CSV" to download filtered results

### Data Model

#### Buyer Fields
- `fullName`: Full name (2-80 characters)
- `email`: Email address (optional)
- `phone`: Phone number (10-15 digits)
- `city`: City selection (Chandigarh, Mohali, Zirakpur, Panchkula, Other)
- `propertyType`: Property type (Apartment, Villa, Plot, Office, Retail)
- `bhk`: BHK configuration (required for Apartment/Villa)
- `purpose`: Buy or Rent
- `budgetMin/Max`: Budget range in rupees
- `timeline`: Expected timeline (0-3m, 3-6m, >6m, Exploring)
- `source`: Lead source (Website, Referral, Walk-in, Call, Other)
- `status`: Current status (New, Qualified, Contacted, Visited, Negotiation, Converted, Dropped)
- `notes`: Additional notes (max 1000 characters)
- `tags`: Array of tags for categorization

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- Validation schemas (Zod)
- CSV parsing and generation
- API rate limiting
- Error boundary components

## 🔒 Security Features

### Rate Limiting
- **API Endpoints**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes  
- **CSV Import**: 10 imports per hour

### Data Protection
- User isolation (ownership-based access)
- Input validation and sanitization
- CSRF protection via NextAuth
- Secure session management

## 🎨 Accessibility

The application follows WCAG 2.1 guidelines:
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast design
- Focus management

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── buyers/            # Buyer management pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── buyer-form.tsx     # Buyer form component
│   ├── buyers-list.tsx    # Buyer list with filters
│   ├── error-boundary.tsx # Error handling
│   └── navigation.tsx     # Main navigation
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── csv.ts            # CSV processing
│   ├── db/               # Database layer
│   ├── rate-limit.ts     # Rate limiting
│   └── validations/      # Zod schemas
└── data/                 # JSON database files
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Email Provider Setup

For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use app password in `EMAIL_SERVER_PASSWORD`

For other providers, adjust SMTP settings accordingly.

### Database Migration

Currently using JSON file storage for development. For production:
1. Implement database adapter (PostgreSQL/MySQL recommended)
2. Update database queries in `src/lib/db/`
3. Add connection pooling and migrations

## 🐛 Troubleshooting

### Common Issues

**Authentication not working**
- Verify email server configuration
- Check NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your domain

**CSV import failing**
- Check file format matches template
- Verify data validation requirements
- Check rate limiting (10 imports/hour)

**Build errors**
- Run `npm install` to update dependencies
- Check TypeScript errors with `npm run type-check`
- Verify environment variables are set

## 📝 API Documentation

### Endpoints

#### Buyers
- `GET /api/buyers` - List buyers with filters
- `POST /api/buyers` - Create new buyer
- `GET /api/buyers/[id]` - Get buyer details
- `PUT /api/buyers/[id]` - Update buyer
- `DELETE /api/buyers/[id]` - Delete buyer

#### CSV Operations
- `POST /api/buyers/import` - Import CSV file
- `GET /api/buyers/export` - Export filtered CSV

#### Authentication
- `POST /api/auth/signin` - Initiate magic link
- `GET /api/auth/callback` - Handle auth callback

### Rate Limits
All endpoints include rate limiting headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed description

---

Built with ❤️ using Next.js and TypeScript
