# Business Dashboard

A comprehensive full-stack business dashboard built with Next.js, Firebase, and TypeScript. Track your business performance across 5 different channels with real-time analytics and reporting.

## Features

### 🔐 Authentication
- Secure Firebase Authentication
- Email/password login and signup
- Protected dashboard routes

### 📊 Data Entry Channels
1. **Sales Campaign** - Track product orders and order values
2. **Recurring Sales** - Monitor recurring revenue by team member
3. **Lead Generation** - Measure lead conversion and value
4. **Abandoned Cart** - Track cart recovery performance
5. **Media Engagement** - Monitor engagement orders and value

### 🎯 Management Tools
- **Product Management** - Add/remove products with dynamic form integration
- **Team Management** - Manage team members for recurring sales tracking
- **Target Setting** - Set and track progress against revenue targets
- **Real-time Progress** - Visual progress bars and achievement status

### 📈 Analytics & Reporting
- **Interactive Charts** - Pie charts, line graphs, and bar charts using Chart.js
- **Advanced Filtering** - Filter by date range, product, team member, and channel
- **CSV Export** - Export filtered data for external analysis
- **Summary Metrics** - Key performance indicators and totals

### ⚡ Advanced Features
- **Auto-refresh** - Real-time data updates every 30 seconds
- **Entry Editing** - Modify existing entries with validation
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Error Handling** - Graceful error handling with user feedback

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication with Email/Password provider
4. Create a Firestore database in production mode
5. Get your Firebase config from Project Settings > General > Your apps
6. Replace the config in `lib/firebase.ts`:

\`\`\`typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
\`\`\`

### 2. Firestore Security Rules

Add these security rules to your Firestore database:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access data when authenticated
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

### 3. Installation

1. Download the project files
2. Install dependencies: `npm install`
3. Update Firebase configuration in `lib/firebase.ts`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Getting Started
1. **Sign Up** - Create your account with email/password
2. **Add Products** - Go to Product Management and add your products
3. **Add Team Members** - Add team members for recurring sales tracking
4. **Set Targets** - Define revenue targets for each product/channel
5. **Enter Data** - Start adding daily entries across the 5 channels
6. **View Analytics** - Monitor performance in the Analytics section

### Data Entry
Each channel has specific fields:
- **Sales Campaign**: Product, Orders, Order Value
- **Recurring Sales**: Product, Orders, Revenue, Team Member
- **Lead Generation**: Product, Leads Generated, Conversion %, Value
- **Abandoned Cart**: Product, Abandoned Carts, Conversion %, Revenue
- **Media Engagement**: Orders, Value

### Analytics Features
- **Orders by Product** - Pie chart showing order distribution
- **Revenue Over Time** - Line chart tracking daily revenue trends
- **Progress vs Target** - Bar chart comparing actual vs target performance
- **Export Reports** - Download filtered data as CSV files

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React

## Database Structure

### Collections
- `products` - Product catalog
- `teamMembers` - Team member roster
- `entries` - Daily data entries across all channels
- `targets` - Revenue targets by product/channel

### Entry Document Structure
\`\`\`typescript
{
  id: string,
  channel: string,
  date: string,
  product?: string,
  teamMember?: string,
  // Dynamic fields based on channel
  orders?: number,
  orderValue?: number,
  revenue?: number,
  // ... other channel-specific fields
  createdAt: Timestamp
}
\`\`\`

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Firebase configuration is correct
3. Ensure Firestore security rules allow authenticated access
4. Check that all required fields are filled in forms

## License

This project is provided as-is for business use. Customize as needed for your specific requirements.
