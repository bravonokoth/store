<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with('category', 'media')->get();
    }

    public function show($id)
    {
        return Product::with('category', 'media')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
        ]);

        $product = Product::create($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'created_product',
            'model_type' => Product::class,
            'model_id' => $product->id,
            'changes' => json_encode($validated),
        ]);

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'string',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'category_id' => 'exists:categories,id',
            'stock' => 'integer|min:0',
        ]);

        $product->update($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'updated_product',
            'model_type' => Product::class,
            'model_id' => $product->id,
            'changes' => json_encode($validated),
        ]);

        return $product;
    }

    public function destroy(Product $product)
    {
        $product->delete();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'deleted_product',
            'model_type' => Product::class,
            'model_id' => $product->id,
            'changes' => null,
        ]);

        return response()->json(['message' => 'Product deleted']);
    }

    public function search(Request $request)
    {
        $query = Product::query();
        if ($request->has('q')) {
            $query->where('name', 'like', '%' . $request->q . '%')
                  ->orWhere('description', 'like', '%' . $request->q . '%');
        }
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        return $query->with('category', 'media')->get();
    }
}