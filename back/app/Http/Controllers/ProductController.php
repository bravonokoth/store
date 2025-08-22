<?php

// app/Http/Controllers/ProductController.php
namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin|superadmin'])->only(['store', 'update', 'destroy', 'uploadImage']);
    }

    public function index(Request $request)
    {
        $products = Product::with('category')
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->sort, fn($q) => $q->orderBy('price', $request->sort))
            ->paginate(10);
        return response()->json($products);
    }

    public function show(Product $product)
    {
        return response()->json($product->load('category', 'media'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'string|nullable',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
        ]);

        $product = Product::create($request->all());
        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'string|max:255',
            'description' => 'string|nullable',
            'price' => 'numeric|min:0',
            'category_id' => 'exists:categories,id',
            'stock' => 'integer|min:0',
        ]);

        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    public function uploadImage(Request $request, Product $product)
    {
        $request->validate(['image' => 'required|image|max:2048']);
        $product->addMedia($request->file('image'))->toMediaCollection('products');
        return response()->json(['message' => 'Image uploaded']);
    }
}