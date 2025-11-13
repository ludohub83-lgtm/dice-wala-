# 🎨 Ludo Admin Panel - Standalone Web Application

A modern, premium admin dashboard for managing the Ludo game platform. Built with Next.js, Tailwind CSS, and Framer Motion.

## ✨ Features

- 🎨 **Modern UI**: Gradient buttons, glassmorphism effects, smooth animations
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Real-time**: Auto-refreshes stats every 30 seconds
- 🔔 **Badge Notifications**: Shows pending counts for payments and withdrawals
- 🎯 **12 Admin Controls**: Complete admin functionality
- 🔌 **API Integration**: Connects to your Ludo app backend

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

For production, use your deployed backend URL:
```env
NEXT_PUBLIC_API_BASE=https://your-backend.railway.app
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
admin-panel/
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js            # Main dashboard page
│   └── globals.css        # Global styles
├── components/
│   ├── AdminDashboard.jsx # Main dashboard component
│   ├── AdminButton.jsx    # Gradient button component
│   ├── StatsCard.jsx      # Stats card component
│   └── modals/
│       ├── PendingPaymentsModal.jsx
│       ├── VerifiedPaymentsModal.jsx
│       ├── FakePaymentsModal.jsx
│       ├── WithdrawRequestsModal.jsx
│       ├── SearchUserModal.jsx
│       └── ChangeScannerModal.jsx
├── lib/
│   └── api.js             # API client functions
└── package.json
```

## 🔌 API Endpoints Used

The admin panel connects to your Ludo app backend:

- `GET /pending-payments` - Fetch pending payments
- `GET /api/admin/payment-requests?status=Pending` - Fetch manual payment requests
- `POST /approve-payment/:id` - Approve payment
- `POST /reject-payment/:id` - Reject payment
- `PUT /api/admin/verify/:id` - Verify manual payment
- `GET /withdraw/pending` - Fetch pending withdrawals
- `POST /withdraw/approve/:id` - Approve withdrawal
- `POST /withdraw/reject/:id` - Reject withdrawal
- `GET /admin/qr-code` - Get QR code
- `PUT /admin/qr-code` - Update QR code
- `GET /admin/search-user?q=query` - Search users

## 🎨 Admin Features

1. **Change Scanner** - Update payment QR code and UPI ID
2. **Pending Payments** - View and approve/reject pending payments
3. **Verified Payments** - View all approved payments
4. **Fake Payments** - View all fake/rejected payments
5. **Withdraw Requests** - Manage withdrawal requests
6. **Search User** - Search users by email/ID
7. **Notifications** - View admin notifications
8. **User Chat Support** - Chat with users (coming soon)
9. **Payment History** - View payment history (coming soon)
10. **Settings** - Admin settings (coming soon)
11. **Reports & Analytics** - View statistics (coming soon)
12. **Whatsapp / Contact** - Contact support

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variable: `NEXT_PUBLIC_API_BASE`
5. Deploy!

### Deploy to Other Platforms

The admin panel can be deployed to any platform that supports Next.js:
- **Netlify**: `npm run build` → Deploy `out` folder
- **Railway**: Auto-detects Next.js
- **Render**: Set build command: `npm run build`

## 🔒 Security Notes

- The admin panel connects to your backend APIs
- Make sure to add authentication/authorization on backend
- Use HTTPS in production
- Keep API base URL secure

## 📝 Notes

- This is a **separate web application** from the Ludo app
- It connects to the Ludo app backend via APIs
- Regular users cannot access this panel
- Only admins should have access

## 🎯 Summary

✅ **Standalone web application**
✅ **Modern UI with gradients and animations**
✅ **Fully responsive**
✅ **Connected to Ludo app backend**
✅ **Ready to deploy**

**The admin panel is ready to use!** 🚀

