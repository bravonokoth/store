<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Order::class);

        $user = auth('sanctum')->user();
        $cartItems = $user ? CartItem::where('user_id', $user->id)->get() : collect($request->input('cart_items', []));

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        $total = 0;
        foreach ($cartItems as $item) {
            $product = Product::find($item->product_id);
            if (!$product || $product->stock < $item->quantity) {
                return response()->json(['message' => "Insufficient stock for product: {$product->name}"], 400);
            }
            $total += $product->price * $item->quantity;
        }

        DB::beginTransaction();
        try {
            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'total' => $total,
                'status' => 'pending',
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => Product::find($item->product_id)->price,
                ]);
                $product = Product::find($item->product_id);
                $product->stock -= $item->quantity;
                $product->save();
            }

            // Clear cart for authenticated users
            if ($user) {
                CartItem::where('user_id', $user->id)->delete();
            }

            DB::commit();
            return response()->json(['message' => 'Order created', 'order' => $order->load('items')], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order creation failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $orders = Order::where('user_id', $user->id)->with('items.product')->get();
        return response()->json(['orders' => $orders]);
    }
}