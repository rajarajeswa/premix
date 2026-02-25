# Kara-Saaram Premix E-Commerce Application

A full-stack e-commerce application for selling authentic South Indian premix products (Sambar, Rasam, Curry, and Speciality blends) with Razorpay payment integration.

## 🌟 Features

- **User Authentication** - Register, login, and profile management
- **Product Catalog** - Browse premix products by category
- **Shopping Cart** - Add/remove items, quantity management
- **Address Management** - Save and manage multiple delivery addresses
- **Razorpay Payment** - Secure payment gateway integration
- **Order Management** - Track orders, view order history
- **Admin Dashboard** - Manage products, view orders, update order status
- **Email Notifications** - Invoice generation and order confirmations

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Sequelize ORM** with MySQL/PostgreSQL
- **JWT** for authentication
- **Razorpay** for payments
- **Nodemailer** for emails

### Frontend
- **React 18** with Vite
- **Bootstrap 5** for styling
- **React Router** for navigation
- **Context API** for state management

## 📁 Project Structure

```
premix/
├── backend/                 # Node.js backend
│   ├── controller/          # Route controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── razorpayController.js
│   │   └── addressController.js
│   ├── model/               # Sequelize models
│   │   ├── User.js
│   │   ├── Premix.js
│   │   ├── Order.js
│   │   └── Address.js
│   ├── middleware/          # Custom middleware
│   │   └── authMiddleware.js
│   ├── services/            # Business logic
│   │   ├── emailService.js
│   │   └── invoiceService.js
│   ├── route/               # API routes
│   │   └── route.js
│   ├── db/                  # Database connection
│   │   └── db-connection.js
│   ├── uploads/             # Product images
│   ├── server.js            # Entry point
│   └── .env.example         # Environment variables template
│
├── ecommerce/               # React frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   │   ├── homepage/
│   │   │   ├── checkout/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── orders/
│   │   │   ├── premix/
│   │   │   └── about/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context providers
│   │   ├── api/             # API client
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   └── index.html
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL or PostgreSQL
- Razorpay account (for payments)
- Email service (SMTP)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajarajeswa/premix.git
   cd premix
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```env
   # Database
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=premix_db
   DB_DIALECT=mysql

   # JWT
   JWT_SECRET=your_jwt_secret

   # Razorpay
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_secret

   # Email (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ADMIN_EMAIL=admin@yourdomain.com
   ```

4. **Start Backend Server**
   ```bash
   npm run dev
   # or
   npm start
   ```

5. **Frontend Setup** (in a new terminal)
   ```bash
   cd ecommerce
   npm install
   ```

6. **Configure Frontend API URL**
   
   Update the API URL in `ecommerce/src/api/client.js` if needed:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000';
   ```

7. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```

8. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 💳 Razorpay Integration

### Payment Flow

1. User clicks "Pay Now" on checkout page
2. Frontend loads Razorpay checkout script
3. Backend creates a Razorpay order via API
4. Razorpay checkout modal opens for payment
5. After payment, signature is verified on backend
6. Order is confirmed and invoice is emailed

### Webhook Setup (Optional)

Configure webhook in Razorpay dashboard:
- URL: `https://yourdomain.com/api/payment/razorpay/webhook`
- Events: `payment.captured`, `payment.failed`

## 📧 Email Features

- Order confirmation emails
- Invoice PDF generation and attachment
- Admin notifications for new orders
- Payment status updates

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user orders |
| GET | `/api/orders/:id` | Get single order |
| PUT | `/api/orders/:id/status` | Update order status (admin) |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment/razorpay/key` | Get Razorpay key |
| POST | `/api/payment/razorpay/create-order` | Create payment order |
| POST | `/api/payment/razorpay/verify` | Verify payment |
| POST | `/api/payment/razorpay/webhook` | Webhook handler |

### Addresses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/addresses` | Get user addresses |
| POST | `/api/addresses` | Create address |
| PUT | `/api/addresses/:id` | Update address |
| DELETE | `/api/addresses/:id` | Delete address |

## 🎨 Product Categories

- **Sambar Premix** - Traditional sambar spice blend
- **Rasam Premix** - Authentic rasam powder
- **Curry Premix** - Versatile curry spice mix
- **Speciality Premix** - Unique regional blends

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Kara-Saaram Team**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
