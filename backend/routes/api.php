<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\MediaController as AdminMediaController;
use App\Http\Controllers\Api\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;


Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Client-side routes
Route::group(['prefix' => 'products'], function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/{product}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductController::class, 'categories']);
});


    Route::post('/cart', [CartController::class, 'store']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}', [NotificationController::class, 'markAsRead']);
});


// Admin-side routes
Route::middleware(['auth:sanctum', 'role:admin|super-admin'])->prefix('admin')->group(function () {
    Route::apiResource('products', AdminProductController::class)->except(['destroy']);
    Route::apiResource('categories', AdminCategoryController::class)->except(['destroy']);
    Route::post('orders', [AdminOrderController::class, 'store']);
    Route::post('media', [AdminMediaController::class, 'store']);
    Route::post('coupons', [AdminCouponController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:super-admin'])->prefix('admin')->group(function () {
    Route::delete('products/{product}'s, [AdminProductController::class, 'destroy']);
    Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'role:admin|super-admin'])->prefix('admin')->group(function () {
    Route::apiResource('products', AdminProductController::class)->except(['destroy']);
    Route::apiResource('categories', AdminCategoryController::class)->except(['destroy']);
    Route::post('orders', [AdminOrderController::class, 'store']);
    Route::post('media', [AdminMediaController::class, 'store']);
    Route::post('coupons', [AdminCouponController::class, 'store']);
    Route::post('inventory', [AdminInventoryController::class, 'store']);

    Route::post('banners', [AdminBannerController::class, 'store']);

});

// Test WebSocket route
Route::get('/test-websocket', function () {
    $event = new \App\Events\TestEvent('Hello, Socket.IO!');
    event($event);

    Http::post('http://localhost:8001/broadcast', [
        'event' => 'TestEvent',
        'channel' => 'test-channel',
        'data' => ['message' => $event->message],
    ]);

    return response()->json(['message' => 'Event fired']);
});