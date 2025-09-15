<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'media'])->paginate(20);
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Product::class);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:products',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku' => 'required|string|unique:products',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'image' => 'nullable|file|image|max:2048', // 2MB max
        ]);

        $product = Product::create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => $request->slug ?: Str::slug($request->name),
            'description' => $request->description,
            'price' => $request->price,
            'discount_price' => $request->discount_price,
            'stock' => $request->stock,
            'sku' => $request->sku,
            'seo_title' => $request->seo_title,
            'seo_description' => $request->seo_description,
            'is_active' => $request->is_active ?? true,
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            Media::create([
                'model_type' => Product::class,
                'model_id' => $product->id,
                'path' => $imagePath,
                'type' => 'image',
            ]);
        }

        return response()->json([
            'message' => 'Product created',
            'product' => $product->load('media'),
        ], 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'media']));
    }

    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:products,slug,' . $product->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'image' => 'nullable|file|image|max:2048',
        ]);

        $product->update($validated);

        if ($request->hasFile('image')) {
            // Delete existing media
            Media::where('model_type', Product::class)
                ->where('model_id', $product->id)
                ->delete();
            $imagePath = $request->file('image')->store('products', 'public');
            Media::create([
                'model_type' => Product::class,
                'model_id' => $product->id,
                'path' => $imagePath,
                'type' => 'image',
            ]);
        }

        return response()->json([
            'message' => 'Product updated',
            'product' => $product->load('media'),
        ]);
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}