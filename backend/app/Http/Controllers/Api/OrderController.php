<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Coupon;
use App\Events\OrderPlaced;
use App\Jobs\ProcessOrder;
use App\Mail\OrderConfirmation;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return Order::where('user_id', $request->user()->id)->get();
    }

    public function show(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id && !$request->user()->hasRole('admin') && !$request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $order;
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $cartItems = Cart::where('user_id', $user->id)->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Check stock
        foreach ($cartItems as $item) {
            if ($item->product->stock < $item->quantity) {
                return response()->json(['message' => 'Insufficient stock for ' . $item->product->name], 400);
            }
        }

        $total = $cartItems->sum(fn($item) => $item->quantity * $item->product->price);

        // Apply coupon (no DB storage)
        if ($request->has('coupon_code')) {
            $coupon = Coupon::where('code', $request->coupon_code)
                ->where('expires_at', '>', now())
                ->first();
            if ($coupon) {
                $total = $total * (1 - $coupon->discount / 100);
            } else {
                return response()->json(['message' => 'Invalid or expired coupon'], 400);
            }
        }

        // Mock payment processing (since payment system is not installed)
       
        $paymentSuccessful = true; // Placeholder for successful payment

        if (!$paymentSuccessful) {
            return response()->json(['message' => 'Payment failed'], 400);
        }

        // Create order
        $order = Order::create([
            'user_id' => $user->id,
            'total' => $total,
            'status' => 'pending',
        ]);

        // Update stock
        foreach ($cartItems as $item) {
            $item->product->decrement('stock', $item->quantity);
        }

        // Clear cart
        Cart::where('user_id', $user->id)->delete();

        // Dispatch events
        ProcessOrder::dispatch($order);
        \Mail::to($user->email)->send(new OrderConfirmation($order));
        OrderPlaced::dispatch($order);

        return response()->json($order, 201);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate(['status' => 'required|string']);
        $order->update($validated);
        $order->user->notify(new \App\Notifications\OrderStatusUpdated($order));
        return $order;
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted']);
    }
}