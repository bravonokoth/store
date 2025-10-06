<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class CartController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', CartItem::class);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::find($validated['product_id']);
        if ($product->stock < $validated['quantity']) {
            return response()->json(['message' => "Insufficient stock for product: {$product->name}"], 400);
        }

        $user = auth('sanctum')->user();
        $sessionId = $request->input('sessionId', Session::getId());

        $cartItem = CartItem::updateOrCreate(
            [
                'user_id' => $user?->id,
                'session_id' => $user ? null : $sessionId,
                'product_id' => $validated['product_id'],
            ],
            ['quantity' => $validated['quantity']]
        );

        return response()->json(['message' => 'Cart item added', 'cart_item' => $cartItem->load('product')], 201);
    }

    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        $sessionId = $request->input('sessionId', Session::getId());

        $cartItems = $user
            ? CartItem::where('user_id', $user->id)->with('product')->get()
            : CartItem::where('session_id', $sessionId)->with('product')->get();

        $total = $cartItems->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });

        return response()->json(['cart_items' => $cartItems, 'total' => $total]);
    }

    public function update(Request $request, $id)
    {
        $this->authorize('update', CartItem::class);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::findOrFail($id);
        if ($cartItem->product->stock < $validated['quantity']) {
            return response()->json(['message' => "Insufficient stock for product: {$cartItem->product->name}"], 400);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        return response()->json(['message' => 'Cart item updated', 'cart_item' => $cartItem->load('product')]);
    }

    public function destroy($id)
    {
        $this->authorize('delete', CartItem::class);

        $cartItem = CartItem::findOrFail($id);
        $cartItem->delete();

        return response()->json(['message' => 'Cart item removed']);
    }
}