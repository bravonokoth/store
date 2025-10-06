<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Address;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        $sessionId = Session::getId();

        // Load cart items
        $cartItems = $user
            ? CartItem::where('user_id', $user->id)->with('product')->get()
            : CartItem::where('session_id', $sessionId)->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Calculate total
        $total = 0;
        foreach ($cartItems as $item) {
            $product = Product::find($item->product_id);
            if (!$product || $product->stock < $item->quantity) {
                return response()->json(['message' => "Insufficient stock for product: {$product->name}"], 400);
            }
            $total += $product->price * $item->quantity;
        }

        // Load addresses
        $addresses = $user
            ? Address::where('user_id', $user->id)->get()
            : Address::where('session_id', $sessionId)->get();

        return response()->json([
            'cart_items' => $cartItems,
            'total' => $total,
            'addresses' => $addresses,
        ]);
    }
}