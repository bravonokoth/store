<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Product;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Purchase::class);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'cost' => 'required|numeric|min:0',
            'supplier' => 'nullable|string',
            'purchase_date' => 'required|date',
        ]);

        $purchase = Purchase::create($validated);

        $product = Product::find($validated['product_id']);
        $product->stock += $validated['quantity'];
        $product->save();

        return response()->json(['message' => 'Purchase created', 'purchase' => $purchase], 201);
    }
}