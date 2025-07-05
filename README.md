# 🥛 Tayba Khalis Milk - Delivery Management System

A comprehensive web-based milk delivery management system built with Next.js, TypeScript, and MongoDB. This system helps milk vendors manage customers, track daily deliveries, generate bills, process payments, and send WhatsApp notifications.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 👥 Customer Management
- Add, edit, and manage customer information
- Individual milk rates and daily quantities per customer
- Customer contact details and addresses
- Delivery order management for route optimization
- Active/inactive customer status

### 🚛 Daily Delivery Tracking
- Date-wise delivery logging
- Multiple delivery statuses: Delivered, Not Delivered, Absent
- Automatic amount calculation based on quantity and rate
- Bulk save functionality for efficient data entry
- Real-time delivery summaries

### 💰 Billing System
- Automatic bill generation from delivery data
- Monthly billing with previous balance tracking
- Bill status management (Pending, Partial, Paid)
- Individual and bulk bill operations
- WhatsApp bill sharing integration

### 💳 Payment Management
- Record payments with multiple methods (Cash, Bank Transfer, Mobile Payment)
- Partial payment support
- Payment history tracking
- Automatic bill status updates
- Outstanding balance management

### 📊 Reports & Analytics
- Monthly delivery reports
- Customer-wise performance analytics
- Revenue tracking and summaries
- Export functionality (CSV)
- Date range filtering

### 📱 WhatsApp Integration
- Direct WhatsApp bill sharing via wa.me links
- Bulk bill sending capability
- Customizable message templates
- No third-party API dependencies

### ⚙️ System Settings
- Global milk rate management
- Historical data preservation
- Rate change tracking with effective dates
- System-wide configuration options

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Additional Tools
- **React Hook Form** - Form handling
- **Date-fns** - Date manipulation
- **CSV Export** - Data export functionality

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB installation
- Git

### Step 1: Clone the Repository
\`\`\`bash
git clone https://github.com/yourusername/tayba-khalis-milk-system.git
cd tayba-khalis-milk-system
\`\`\`

### Step 2: Install Dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

### Step 3: Environment Setup
Create a `.env.local` file in the root directory:

\`\`\`env
# MongoDB Connection
MONGODB_CONNECTION_STRINGS=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
\`\`\`

### Step 4: Database Setup
The system will automatically create the required collections and indexes when you first run it.

### Step 5: Run the Development Server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Configuration

### MongoDB Setup
1. Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/)
2. Create a new cluster
3. Get your connection string
4. Replace the connection string in `.env.local`

### WhatsApp Integration
The system uses direct WhatsApp web links (`wa.me`) - no API keys required!

## 📖 Usage

### Getting Started

1. **Add Customers**: Start by adding your milk delivery customers
2. **Daily Deliveries**: Log daily milk deliveries for each customer
3. **Generate Bills**: Bills are automatically generated from delivery data
4. **Record Payments**: Track customer payments and update bill status
5. **Send Bills**: Share bills via WhatsApp with one click

### Workflow

\`\`\`
Customers → Daily Deliveries → Bills → Payments → Reports
\`\`\`

### Key Pages

#### 🏠 Dashboard (`/`)
- Redirects to delivery page for quick access

#### 👥 Customers (`/customers`)
- Manage customer database
- Add/edit customer information
- Set individual rates and quantities

#### 🚛 Delivery (`/delivery`)
- Daily delivery logging
- Date-wise delivery tracking
- Bulk save functionality
- Real-time calculations

#### 💰 Bills (`/bills`)
- View monthly bills
- Payment status tracking
- WhatsApp bill sharing
- Bill details and history

#### 💳 Payments (`/payments`)
- Record customer payments
- Payment history
- Outstanding balance tracking
- Multiple payment methods

#### 📊 Reports (`/reports`)
- Monthly performance reports
- Customer analytics
- Revenue summaries
- Data export options

#### ⚙️ Settings (`/settings`)
- System configuration
- Global rate management
- Historical data protection

## 🔌 API Documentation

### Customer Endpoints

\`\`\`typescript
GET    /api/customers           // Get all customers
POST   /api/customers           // Create new customer
PUT    /api/customers/[id]      // Update customer
DELETE /api/customers/[id]      // Deactivate customer
PUT    /api/customers/reorder   // Reorder customers
GET    /api/customers/count     // Get customer count
\`\`\`

### Delivery Endpoints

\`\`\`typescript
GET  /api/deliveries            // Get deliveries by date
POST /api/deliveries            // Create/update delivery
POST /api/deliveries/bulk       // Bulk save deliveries
\`\`\`

### Bill Endpoints

\`\`\`typescript
GET  /api/bills                 // Get bills with filters
POST /api/bills/generate        // Generate bills for month
GET  /api/bills/[id]/details    // Get bill details
POST /api/bills/[id]/payment    // Record payment
POST /api/bills/[id]/mark-sent  // Mark bill as sent
\`\`\`

### Payment Endpoints

\`\`\`typescript
GET  /api/payments              // Get payments with filters
POST /api/payments              // Create payment record
\`\`\`

### Report Endpoints

\`\`\`typescript
GET /api/reports                // Get monthly reports
\`\`\`

### WhatsApp Endpoints

\`\`\`typescript
POST /api/whatsapp/send-bills  // Generate WhatsApp links
\`\`\`

### Settings Endpoints

\`\`\`typescript
GET  /api/settings              // Get system settings
POST /api/settings              // Update settings
\`\`\`

## 🗄️ Database Schema

### Collections

#### Customers
\`\`\`typescript
{
  _id: ObjectId,
  name: String,
  phone: String,
  address: String,
  ratePerLiter: Number,
  defaultMilkQuantity: Number,
  deliveryOrder: Number,
  isActive: Boolean,
  totalOutstanding: Number,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

#### Deliveries
\`\`\`typescript
{
  _id: ObjectId,
  customerId: ObjectId,
  customerName: String,
  date: String, // YYYY-MM-DD
  quantity: Number,
  status: String, // delivered, not_delivered, absent
  amount: Number,
  rateAtTimeOfDelivery: Number,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

#### Bills
\`\`\`typescript
{
  _id: ObjectId,
  customerId: ObjectId,
  customerName: String,
  month: String, // YYYY-MM
  totalLiters: Number,
  totalAmount: Number,
  previousBalance: Number,
  totalDue: Number,
  amountPaid: Number,
  remainingBalance: Number,
  status: String, // pending, partial, paid
  billSent: Boolean,
  billSentAt: Date,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

#### Payments
\`\`\`typescript
{
  _id: ObjectId,
  customerId: ObjectId,
  customerName: String,
  billId: ObjectId,
  amount: Number,
  paymentDate: Date,
  paymentMethod: String, // cash, bank_transfer, mobile_payment
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

#### Settings
\`\`\`typescript
{
  _id: ObjectId,
  defaultMilkRate: Number,
  lastRateChangeDate: Date,
  effectiveDate: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## 📱 Screenshots

### Customer Management
![Customer Management](![Picture4](https://github.com/user-attachments/assets/cabde1d1-6b71-41c5-afa4-78344ff13ac6)
)

### Daily Delivery Tracking
![Delivery Tracking](![Picture5](https://github.com/user-attachments/assets/0205e516-2ed7-4184-ab09-056129db0284)
)

### Billing System
![Billing System](![Picture5](https://github.com/user-attachments/assets/4637c225-aadc-444c-a6b2-efeb96ec82a3)
)

### Payment Management
![Payment Management](![Picture6](https://github.com/user-attachments/assets/051715c5-b550-4395-af0d-69bcd3c62f5b)
)

### Reports & Analytics
![Reports]()

## 🔧 Development

### Project Structure
\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── customers/         # Customer management pages
│   ├── delivery/          # Delivery tracking pages
│   ├── bills/            # Billing pages
│   ├── payments/         # Payment pages
│   ├── reports/          # Reports pages
│   └── settings/         # Settings pages
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── lib/                  # Utility functions
├── models/               # Database models
├── middleware/           # Custom middleware
└── public/              # Static assets
\`\`\`

### Key Components

#### Navigation
- Responsive navigation bar
- Mobile-friendly menu
- Active page highlighting

#### Forms
- Customer form with validation
- Payment modal with amount validation
- Settings form with rate management

#### Tables
- Sortable data tables
- Responsive design
- Action buttons

#### Modals
- Bill details modal
- Payment recording modal
- Confirmation dialogs

### Development Commands

\`\`\`bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

### Environment Variables for Production
\`\`\`env
MONGODB_CONNECTION_STRINGS=your-production-mongodb-url
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
\`\`\`

## 🔒 Security Features

- Input validation and sanitization
- MongoDB injection prevention
- Type-safe API endpoints
- Error handling and logging
- Data validation with Mongoose schemas

## 🎯 Performance Optimizations

- Server-side rendering with Next.js
- Optimized database queries
- Efficient aggregation pipelines
- Lazy loading components
- Image optimization
- Caching strategies

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
\`\`\`bash
# Check MongoDB connection string
# Ensure IP whitelist includes your server IP
# Verify database user permissions
\`\`\`

#### Build Errors
\`\`\`bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
\`\`\`

#### Data Not Showing in Bills
\`\`\`bash
# Check delivery data
GET /api/debug/deliveries?month=2024-12

# Verify amounts are calculated
# Check console logs for errors
\`\`\`

## 📈 Future Enhancements

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Inventory management
- [ ] Route optimization
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with accounting software
- [ ] Customer portal
- [ ] SMS notifications
- [ ] Backup and restore functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use consistent naming conventions
- Add proper error handling
- Write meaningful commit messages
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: https://github.com/IbrahimBajwa313/MilkDeliverySystem
- Email: ibrahimbajwa1065@gmail.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [MongoDB](https://www.mongodb.com/) - Database
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

If you have any questions or need help, please:

1. Create a new issue if your problem isn't already reported
2. Contact the maintainer at ibrahimbajwa1065@gmail.com

---

**Made with ❤️ for milk delivery businesses**

