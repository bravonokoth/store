<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'media'])->paginate(20);
        return response()->json($products);
    }

    public function store(Request $request)
    {
        try {
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
                'is_featured' => 'boolean',
                'image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
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
                'is_featured' => $request->is_featured ?? false,
            ]);

            if ($request->hasFile('image')) {
                if (!$request->file('image')->isValid()) {
                    Log::error('Invalid image file uploaded', [
                        'file' => $request->file('image')->getClientOriginalName(),
                    ]);
                    return response()->json(['message' => 'Invalid image file'], 400);
                }
                $imagePath = $request->file('image')->store('products', 'public');
                Media::create([
                    'model_type' => 'App\Models\Product',
                    'model_id' => $product->id,
                    'path' => $imagePath,
                    'type' => 'image',
                ]);
            }

            return response()->json([
                'message' => 'Product created',
                'product' => $product->load(['category', 'media']),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Product store error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to create product', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'media']));
    }

    public function update(Request $request, Product $product)
    {
        try {
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
                'is_featured' => 'boolean',
                'image' => 'nullable|file|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            $product->update([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'discount_price' => $validated['discount_price'],
                'stock' => $validated['stock'],
                'sku' => $validated['sku'],
                'seo_title' => $validated['seo_title'],
                'seo_description' => $validated['seo_description'],
                'is_active' => $validated['is_active'] ?? true,
                'is_featured' => $validated['is_featured'] ?? false,
            ]);

            if ($request->hasFile('image')) {
                $oldMedia = Media::where('model_type', 'App\Models\Product')
                    ->where('model_id', $product->id)
                    ->first();
                if ($oldMedia) {
                    Storage::disk('public')->delete($oldMedia->path);
                    $oldMedia->delete();
                }
                if (!$request->file('image')->isValid()) {
                    Log::error('Invalid image file uploaded', [
                        'file' => $request->file('image')->getClientOriginalName(),
                    ]);
                    return response()->json(['message' => 'Invalid image file'], 400);
                }
                $imagePath = $request->file('image')->store('products', 'public');
                Media::create([
                    'model_type' => 'App\Models\Product',
                    'model_id' => $product->id,
                    'path' => $imagePath,
                    'type' => 'image',
                ]);
            }

            return response()->json([
                'message' => 'Product updated',
                'product' => $product->load(['category', 'media']),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Product update error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to update product', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Product $product)
    {
        try {
            $this->authorize('delete', $product);
            $media = Media::where('model_type', 'App\Models\Product')
                ->where('model_id', $product->id)
                ->first();
            if ($media) {
                Storage::disk('public')->delete($media->path);
                $media->delete();
            }
            $product->delete();
            return response()->json(['message' => 'Product deleted'], 200);
        } catch (\Exception $e) {
            Log::error('Product destroy error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to delete product'], 500);
        }
    }
}