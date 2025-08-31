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

        $user = auth('sanctum')->user();
        $sessionId = Session::getId();

        if ($user) {
            $cartItem = CartItem::updateOrCreate(
                ['user_id' => $user->id, 'product_id' => $validated['product_id']],
                ['quantity' => $validated['quantity']]
            );
        } else {
            $cartItem = CartItem::updateOrCreate(
                ['user_id' => null, 'product_id' => $validated['product_id'], 'session_id' => $sessionId],
                ['quantity' => $validated['quantity']]
            );
        }

        return response()->json(['message' => 'Cart item added', 'cart_item' => $cartItem], 201);
    }

    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        $sessionId = Session::getId();

        if ($user) {
            $cartItems = CartItem::where('user_id', $user->id)->with('product')->get();
        } else {
            $cartItems = CartItem::where('user_id', null)->where('session_id', $sessionId)->with('product')->get();
        }

        return response()->json(['cart_items' => $cartItems]);
    }
}