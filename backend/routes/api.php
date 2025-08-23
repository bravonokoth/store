<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BlogCategoryController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuditLogController;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/blogs', [BlogController::class, 'index']);
Route::get('/blogs/{id}', [BlogController::class, 'show']);
Route::get('/blog-categories', [BlogCategoryController::class, 'index']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User Dashboard
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::get('/reviews/product/{product_id}', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
});

// Admin Routes
Route::middleware(['auth:sanctum', 'role:admin|super_admin'])->group(function () {
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    Route::apiResource('orders', OrderController::class)->only(['update', 'destroy']);
    Route::apiResource('coupons', CouponController::class);
    Route::apiResource('blogs', BlogController::class)->except(['index', 'show']);
    Route::apiResource('blog-categories', BlogCategoryController::class)->except(['index']);
    Route::apiResource('media', MediaController::class);
    Route::get('/analytics', [AnalyticsController::class, 'index']);
});

// Super Admin Routes
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', UserController::class);
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
});