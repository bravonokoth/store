<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\MediaController as AdminMediaController;
use App\Http\Controllers\Api\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\Api\Admin\BannerController as AdminBannerController;
use Illuminate\Support\Facades\Http;

Route::options('{any}', function () {
    return response()->json([], 204)
        ->header('Access-Control-Allow-Origin', 'https://store-one-olive.vercel.app')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        ->header('Access-Control-Allow-Credentials', 'true');
})->where('any', '.*');

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Client-side routes
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/{product}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductController::class, 'categories']);
});

Route::post('/cart', [CartController::class, 'store']);
Route::get('/cart', [CartController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}', [NotificationController::class, 'markAsRead']);
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
});

// Admin-side routes
Route::middleware(['auth:sanctum', 'role:admin|super_admin'])->prefix('admin')->group(function () {
    Route::apiResource('products', AdminProductController::class);
    Route::apiResource('categories', AdminCategoryController::class);
    Route::post('orders', [AdminOrderController::class, 'store']);
    Route::post('media', [AdminMediaController::class, 'store']);
    Route::post('coupons', [AdminCouponController::class, 'store']);
    Route::post('inventory', [AdminInventoryController::class, 'store']);
    Route::post('banners', [AdminBannerController::class, 'store']);
    Route::get('categories/search', [AdminCategoryController::class, 'search']);
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