# Store - Full Stack E-Commerce Application

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Laravel](https://img.shields.io/badge/Laravel-9.x-FF2D20?logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs)](https://nodejs.org)

A modern, full-stack e-commerce application built with **React.js** frontend, **Laravel** backend API, and real-time capabilities powered by **Socket.io**.

## ✨ Features

- **User Authentication & Authorization**: Secure login/registration with role-based access control (Client, Admin, Super Admin)
- **Product Management**: Complete CRUD operations with image uploads, pricing, descriptions, and inventory management
- **Shopping Cart**: Real-time cart management with persistent storage
- **Order Processing**: Full order lifecycle management with order tracking
- **Admin Dashboard**: Comprehensive admin panel for managing products, categories, users, orders, and analytics
- **Real-time Notifications**: Live updates using Socket.io for order status, notifications, and events
- **Blog System**: Manage blog posts and categories with full CRUD operations
- **User Reviews & Ratings**: Product review system with ratings
- **Coupon Management**: Create and apply discount coupons to orders
- **Search & Filtering**: Advanced product search and category-based filtering
- **Media Management**: Upload and manage product images and assets
- **Audit Logging**: Track user actions and system events for security and compliance

## 🏗️ Architecture

This project follows a **microservices-inspired architecture**:

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                   │
│              afront/ (Vite + TypeScript)            │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST API
                   ▼
┌─────────────────────────────────────────────────────┐
│               Backend API (Laravel 9)               │
│              backend/ (RESTful API)                 │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
    ┌────────┐          ┌──────────┐
    │ MySQL  │          │ Socket.io│
    │ (Data) │          │(Real-time)
    └────────┘          └──────────┘
```

## 💻 Tech Stack

### Frontend (`afront/`)
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Redux Toolkit** - State management
- **React Router v7** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

### Backend (`backend/`)
- **Laravel 9** - PHP framework
- **Laravel Sanctum** - API authentication
- **Spatie Laravel Permission** - Role & permission management
- **MySQL** - Database
- **Redis** - Caching (optional)

### Real-time Server (`socket_server/`)
- **Node.js** - Runtime
- **Express** - HTTP server
- **Socket.io** - WebSocket communication
- **Axios** - Backend communication

## 📋 Prerequisites

- **PHP 8.0+** (for Laravel backend)
- **Node.js 18+** (for React frontend and Socket server)
- **MySQL 8.0+** (or compatible database)
- **Composer** (PHP package manager)
- **npm or yarn** (Node package manager)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/bravonokoth/store.git
cd store
```

### 2. Setup Backend (Laravel)

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
# DB_DATABASE=store
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Start Laravel development server
php artisan serve
# Backend runs at: http://localhost:8000
```

### 3. Setup Frontend (React)

```bash
cd afront

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs at: http://localhost:5173
```

### 4. Setup Socket Server (Real-time)

```bash
cd socket_server

# Install dependencies
npm install

# Start socket server
npm start
# Socket server runs at: http://localhost:3000
```

## 📚 API Documentation

The backend API follows RESTful conventions. Key endpoints include:

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details

### Admin
- `GET /api/users` - List users (Super Admin only)
- `GET /api/analytics` - Get analytics data (Admin only)
- `GET /api/audit-logs` - View audit logs (Super Admin only)

See `backend/routes/api.php` for the complete API route list.

## 🔐 Authentication & Authorization

The application uses **Laravel Sanctum** for API token-based authentication and **Spatie Laravel Permission** for role-based access control.

### User Roles
1. **Client** - Regular users who can browse products and place orders
2. **Admin** - Can manage products, orders, and view analytics
3. **Super Admin** - Full system access, can manage users and roles

Example authenticated request:
```javascript
const response = await axios.get('/api/orders', {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

## 🗄️ Database Structure

Key models and relationships:
- **User** - Application users with roles
- **Product** - E-commerce products
- **Category** - Product categories
- **Cart** - Shopping cart items
- **Order** - Customer orders
- **OrderItem** - Individual items in orders
- **Review** - Product reviews and ratings
- **Coupon** - Discount coupons
- **Blog** - Blog posts and articles
- **Role** - User roles (Client, Admin, Super Admin)
- **Permission** - Access permissions

## 🧪 Testing

Run tests for the backend:

```bash
cd backend

# Run all tests
php artisan test

# Run specific test file
php artisan test --filter AuthTest

# Run with coverage
php artisan test --coverage
```

## 📦 Deployment

### Frontend Deployment
```bash
cd afront
npm run build
# Upload contents of `dist/` folder to your hosting
```

### Backend Deployment
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan migrate --force
# Upload to server and configure web root to `public/`
```

## 🐛 Troubleshooting

### Permission Denied Error (Storage)
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Missing Rate Limiter
Ensure rate limiter is defined in `bootstrap/app.php` or `routes/api.php`:
```php
RateLimiter::for('api', function ($request) {
    return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
});
```

### Database Connection Issues
```bash
# Test database connection
php artisan tinker
>>> DB::connection()->getPDO();
```

## 📂 Project Structure

```
store/
├── afront/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux state management
│   │   ├── services/       # API client & utilities
│   │   └── App.tsx         # Root component
│   └── package.json
├── backend/                # Laravel Backend API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # API endpoints
│   │   │   └── Middleware/       # Custom middleware
│   │   ├── Models/               # Eloquent models
│   │   └── Exceptions/
│   ├── database/
│   │   ├── migrations/           # Database migrations
│   │   └── seeders/              # Database seeders
│   ├── routes/
│   │   └── api.php               # API routes
│   └── composer.json
├── socket_server/          # Node.js Real-time Server
│   ├── server.js
│   └── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Help

- **Issues**: Report bugs using [GitHub Issues](https://github.com/bravonokoth/store/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/bravonokoth/store/discussions)
- **Documentation**: Check the wiki for detailed guides

## 👤 Author

**Bravon Okoth**
- GitHub: [@bravonokoth](https://github.com/bravonokoth)
- Email: bravon@example.com

---

**Happy coding! 🎉**

-----

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bravonokoth/store.git
    cd store
    ```
2.  **Backend Setup (`back` folder):**
      * Navigate to the backend directory: `cd back`
      * Install Composer dependencies: `composer install`
      * Set up your `.env` file and database connection.
      * Run database migrations: `php artisan migrate`
      * Start the Laravel development server: `php artisan serve`
3.  **Frontend Setup (`front` folder):**
      * Navigate to the frontend directory: `cd ../front`
      * Install Node.js dependencies: `npm install`
      * Start the React development server: `npm start`