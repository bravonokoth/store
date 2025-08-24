<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Inventory::class);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer',
            'type' => 'required|in:adjustment,restock,sale',
            'notes' => 'nullable|string',
        ]);

        $inventory = Inventory::create($validated);

        $product = Product::find($validated['product_id']);
        $product->stock += $validated['quantity'];
        $product->save();

        return response()->json(['message' => 'Inventory created', 'inventory' => $inventory], 201);
    }
}