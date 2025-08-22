
# E-commerce Project

This project is a full-stack e-commerce application built with **React.js** for the frontend and **Laravel** for the backend. The two parts of the application are completely separate and communicate via a RESTful API.

-----

## 🚀 Key Features

  * **Product Management**: CRUD operations for products, including images, prices, and descriptions.
  * **User Authentication**: Secure user registration, login, and profile management using Laravel Sanctum for API token authentication.
  * **Shopping Cart**: A dynamic shopping cart that stores items and calculates totals on the frontend.
  * **Order Processing**: Customers can place orders, and the backend handles order creation and payment processing (e.g., with Laravel Cashier).
  * **Admin Dashboard**: A separate interface for administrators to manage products, users, and orders.
  * **Search & Filtering**: Functionality to search for products and filter by categories or other attributes.

-----

## 💻 Tech Stack

### Frontend (`front` folder)

  * **React.js**: A JavaScript library for building the user interface.
  * **Axios**: A promise-based HTTP client for making API requests to the Laravel backend.
  * **React Router**: For client-side routing and navigation.
  * **State Management**: (e.g., Redux, Zustand, or Context API) to manage application state.

### Backend (`back` folder)

  * **Laravel**: A PHP framework for building the API and handling server-side logic.
  * **Laravel Sanctum**: Provides a simple authentication system for SPAs.
  * **Spatie Packages**: Used for features like user roles/permissions (`laravel-permission`) and file uploads (`laravel-medialibrary`).
  * **Laravel Cashier**: For subscription and payment handling with services like Stripe.
  * **MySQL**: The relational database used to store all application data.

-----

## 📂 Folder Structure

The project is organized into two main directories:

  * **`/front`**: Contains the React.js application.
      * `src/components`: Reusable UI components.
      * `src/pages`: Top-level components for different routes (e.g., `Products.js`, `Cart.js`).
      * `src/api`: Functions for interacting with the backend API.
  * **`/back`**: Contains the Laravel application.
      * `app/Http/Controllers/Api`: API endpoints for the frontend.
      * `app/Models`: Eloquent models for database interaction.
      * `database/migrations`: Database schema definitions.
      * `routes/api.php`: The API route definitions.

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