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
    $query = Product::with(['category', 'media']);

    // Filter by category
    if ($request->has('category')) {
        $query->whereHas('category', function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->category . '%');
        });
    }

    // Filter by price range
    if ($request->has('min_price')) {
        $query->where('price', '>=', $request->min_price);
    }
    if ($request->has('max_price')) {
        $query->where('price', '<=', $request->max_price);
    }

    // Filter by stock
    if ($request->has('in_stock') && $request->in_stock) {
        $query->where('stock', '>', 0);
    }

    // Filter by search
    if ($request->has('search')) {
        $query->where(function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->search . '%')
              ->orWhere('description', 'like', '%' . $request->search . '%');
        });
    }

    // Filter by featured
    if ($request->has('is_featured') && $request->is_featured) {
        $query->where('is_featured', true);
    }

    // Sorting
    if ($request->has('sort_by')) {
        switch ($request->sort_by) {
            case 'price':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'newest':
                $query->orderBy('id', 'desc');
                break;
            default:
                $query->orderBy('name', 'asc');
        }
    }

    $products = $query->paginate(20);
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