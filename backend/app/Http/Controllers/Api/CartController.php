<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        return Cart::where('user_id', $request->user()->id)->with('product')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::create([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
            'quantity' => $validated['quantity'],
        ]);

        return response()->json($cart, 201);
    }

    public function update(Request $request, Cart $cart)
    {
        if ($cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate(['quantity' => 'required|integer|min:1']);
        $cart->update($validated);
        return $cart;
    }

    public function destroy(Request $request, Cart $cart)
    {
        if ($cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cart->delete();
        return response()->json(['message' => 'Item removed']);
    }
}