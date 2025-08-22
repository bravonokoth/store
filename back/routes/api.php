<?php

// routes/api.php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\ShippingZoneController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\NotificationController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/verify', [AuthController::class, 'verify']);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::patch('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/delete', [UserController::class, 'destroy']);
    Route::get('/orders', [OrderController::class, 'userOrders']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/add', [WishlistController::class, 'add']);
    Route::post('/wishlist/remove', [WishlistController::class, 'remove']);
    Route::post('/coupons/apply', [CouponController::class, 'apply']);
});

Route::middleware(['auth:sanctum', 'role:admin|superadmin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
    Route::delete('/users/{user}', [UserController::class, 'destroyUser']);
    Route::post('/users/{user}/roles', [UserController::class, 'assignRole']);
    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::post('/products/upload-image', [ProductController::class, 'uploadImage']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::patch('/orders/{order}/tracking', [OrderController::class, 'updateTracking']);
    Route::patch('/orders/{order}/shipping-status', [OrderController::class, 'updateShippingStatus']);
    Route::get('/orders/{order}/invoice', [OrderController::class, 'generateInvoice']);
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::patch('/reviews/{review}/status', [ReviewController::class, 'approve']);
    Route::patch('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    Route::post('/reviews/{review}/response', [ReviewController::class, 'respond']);
    Route::apiResource('posts', PostController::class)->except(['index', 'show']);
    Route::post('/coupons', [CouponController::class, 'store']);
    Route::apiResource('shipping-zones', ShippingZoneController::class)->except(['index']);
    Route::apiResource('banners', BannerController::class)->except(['index']);
    Route::get('/analytics/sales', [AnalyticsController::class, 'sales']);
    Route::get('/analytics/products', [AnalyticsController::class, 'products']);
    Route::get('/notifications', [NotificationController::class, 'index']);
});

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::get('/shipping-zones', [ShippingZoneController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);