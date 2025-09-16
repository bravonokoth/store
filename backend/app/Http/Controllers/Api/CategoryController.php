<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get all categories with optional filtering and product count.
     */
    public function index(Request $request)
    {
        $query = Category::withCount('products');

        // Optional search filter
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%");
        }

        // Optional parent_id filter (for top-level or child categories)
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        $categories = $query->get()->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->image ? asset('storage/' . $category->image) : null,
                'products_count' => $category->products_count,
                'parent_id' => $category->parent_id,
            ];
        });

        return response()->json(['data' => $categories]);
    }

    /**
     * Get a specific category with its products.
     */
    public function show(Category $category)
    {
        $category->load(['products' => function ($query) {
            $query->with('media')->where('is_active', true);
        }]);

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $category->image ? asset('storage/' . $category->image) : null,
            'products_count' => $category->products_count,
            'parent_id' => $category->parent_id,
            'products' => $category->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'description' => $product->description,
                    'price' => $product->price,
                    'stock' => $product->stock,
                    'image' => $product->media->first() ? asset('storage/' . $product->media->first()->path) : null,
                    'is_active' => $product->is_active,
                    'is_featured' => $product->is_featured ?? false,
                ];
            }),
        ]);
    }
}