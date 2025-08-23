<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class AnalyticsController extends Controller
{
    public function index()
    {
        $totalSales = Cache::remember('total_sales', 3600, fn () => Order::sum('total'));
        $totalOrders = Cache::remember('total_orders', 3600, fn () => Order::count());
        $totalUsers = Cache::remember('total_users', 3600, fn () => User::count());
        $topProducts = Cache::remember('top_products', 3600, fn () => Product::withCount('orders')
            ->orderBy('orders_count', 'desc')
            ->take(5)
            ->get());

        return response()->json([
            'total_sales' => $totalSales,
            'total_orders' => $totalOrders,
            'total_users' => $totalUsers,
            'top_products' => $topProducts,
        ]);
    }
}