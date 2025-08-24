<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']); // Clients only
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

// Admin-side routes
Route::middleware(['auth:sanctum', 'role:admin|super-admin'])->prefix('admin')->group(function () {
    Route::apiResource('products', AdminProductController::class)->except(['destroy']);
    Route::apiResource('categories', AdminCategoryController::class)->except(['destroy']);
});

Route::middleware(['auth:sanctum', 'role:super-admin'])->prefix('admin')->group(function () {
    Route::delete('products/{product}', [AdminProductController::class, 'destroy']);
    Route::delete('categories/{category}', [AdminCategoryController::class, 'destroy']);
});