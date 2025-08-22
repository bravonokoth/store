<?php

// app/Http/Controllers/AnalyticsController.php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin|superadmin']);
    }

    public function sales(Request $request)
    {
        $sales = Order::selectRaw('DATE(created_at) as date, SUM(total) as total')
            ->groupBy('date')
            ->get();
        return response()->json($sales);
    }

    public function products(Request $request)
    {
        $products = Product::withCount('orderItems')->orderBy('order_items_count', 'desc')->take(10)->get();
        return response()->json($products);
    }
}