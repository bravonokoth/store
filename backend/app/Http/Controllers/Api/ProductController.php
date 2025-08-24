<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category'])
            ->when($request->category, fn($query, $category) => $query->where('category_id', $category))
            ->when($request->search, fn($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->where('is_active', true)
            ->paginate(20);

        return response()->json($products);
    }

    public function show(Product $product)
    {
        if (!$product->is_active) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json($product->load(['category']));
    }

    public function categories()
    {
        $categories = Category::with('children')->whereNull('parent_id')->get();
        return response()->json($categories);
    }
}