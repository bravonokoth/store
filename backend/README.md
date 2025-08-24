
# Laravel 9 API Backend (RBAC Auth)

This is a **Laravel 9 backend API** with authentication and **Role-Based Access Control (RBAC)**.  
Users can register as **clients**, while **admin** and **super-admin** accounts are seeded and not available for registration.

## Features

- User authentication with **Laravel Sanctum**
- Role-based access control with **Spatie Laravel Permission**
- Auth endpoints:
  - Register (clients only)
  - Login
  - Profile
  - Logout
- Unit tests for auth workflow

---

## Requirements

- PHP >= 8.0
- Composer
- MySQL/PostgreSQL/SQLite
- Laravel 9

---

## Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd backend
````

2. Install dependencies:

   ```bash
   composer install
   ```

3. Copy `.env`:

   ```bash
   cp .env.example .env
   ```

4. Generate app key:

   ```bash
   php artisan key:generate
   ```

5. Run migrations & seed roles and admin users:

   ```bash
   php artisan migrate --seed
   ```

6. Start server:

   ```bash
   php artisan serve --port=8001
   ```

---

## Seeded Roles & Users

Seeder creates 3 roles:

* `client` (assigned at registration)
* `admin`
* `super-admin`

Seeder also creates sample admin users:

* **Admin User**

  * email: `admin@example.com`
  * password: `password`
* **Super Admin User**

  * email: `superadmin@example.com`
  * password: `password`

---

## API Endpoints

### Register (clients only)

```bash
POST /api/auth/register
```

**Request body:**

```json
{
  "name": "Client User",
  "email": "client@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "name": "Client User",
    "email": "client@example.com"
  },
  "message": "Client registered successfully"
}
```

---

### Login

```bash
POST /api/auth/login
```

**Request body:**

```json
{
  "email": "client@example.com",
  "password": "password"
}
```

**Response:**

```json
{
  "access_token": "your_token_here",
  "token_type": "Bearer",
  "role": "client"
}
```

---

### Profile (requires Bearer token)

```bash
GET /api/auth/profile
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "id": 1,
  "name": "Client User",
  "email": "client@example.com",
  "roles": ["client"]
}
```

---

### Logout

```bash
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

---

## Running Tests

Run feature tests (includes Auth test):

```bash
php artisan test --filter=AuthTest
```

✅ Current tests:

* Client can register, login, and fetch profile.

---

## Next Steps

* Add role-based route protection (`admin`, `super-admin`)
* Build resource controllers for clients and admin-only sections
* Expand test coverage

---

```
## Project Structure

app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── AuthController.php       # Existing
│   │   │   ├── ProductController.php    # Client-side
│   │   │   ├── Admin/
│   │   │   │   ├── ProductController.php   # Admin-side
│   │   │   │   ├── CategoryController.php  # Admin-side
├── Models/
│   ├── Category.php
│   ├── Product.php
│   ├── User.php
├── Policies/
│   ├── CategoryPolicy.php
│   ├── ProductPolicy.php
database/
├── factories/
│   ├── CategoryFactory.php
│   ├── ProductFactory.php
├── migrations/
│   ├── YYYY_MM_DD_create_categories_table.php
│   ├── YYYY_MM_DD_create_products_table.php
├── seeders/
│   ├── DatabaseSeeder.php  # Provided
│   ├── RoleSeeder.php      # Provided
│   ├── UserSeeder.php      # Provided
tests/
├── Feature/
│   ├── ProductTest.php
│   ├── CategoryTest.php