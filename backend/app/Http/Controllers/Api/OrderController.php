<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Order::class);

        $user = auth('sanctum')->user();
        $sessionId = $request->input('sessionId', Session::getId()); // Use request sessionId if provided

        // Validate input
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.first_name' => 'required|string|max:255',
            'shipping_address.last_name' => 'required|string|max:255',
            'shipping_address.email' => 'required|email|max:255',
            'shipping_address.phone' => 'required|string|max:20',
            'shipping_address.line1' => 'required|string|max:255',
            'shipping_address.line2' => 'nullable|string|max:255',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.state' => 'required|string|max:100',
            'shipping_address.zip_code' => 'nullable|string|max:20',
            'shipping_address.country' => 'required|string|max:100',
            'billing_address' => 'nullable|array',
            'billing_address.first_name' => 'required_if:billing_address,null|string|max:255',
            'billing_address.last_name' => 'required_if:billing_address,null|string|max:255',
            'billing_address.email' => 'required_if:billing_address,null|email|max:255',
            'billing_address.phone' => 'required_if:billing_address,null|string|max:20',
            'billing_address.line1' => 'required_if:billing_address,null|string|max:255',
            'billing_address.line2' => 'nullable|string|max:255',
            'billing_address.city' => 'required_if:billing_address,null|string|max:100',
            'billing_address.state' => 'required_if:billing_address,null|string|max:100',
            'billing_address.zip_code' => 'nullable|string|max:20',
            'billing_address.country' => 'required_if:billing_address,null|string|max:100',
            'total' => 'required|numeric|min:0',
        ]);

        // Load cart items with products in one query
        $cartItems = $user
            ? CartItem::where('user_id', $user->id)->with('product')->get()
            : CartItem::where('session_id', $sessionId)->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Calculate and validate total
        $calculatedTotal = $cartItems->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });

        if (abs($calculatedTotal - $request->total) > 0.01) {
            return response()->json(['message' => 'Total mismatch'], 400);
        }

        // Validate stock
        foreach ($cartItems as $item) {
            if (!$item->product || $item->product->stock < $item->quantity) {
                return response()->json(['message' => "Insufficient stock for product: {$item->product->name}"], 400);
            }
        }

        DB::beginTransaction();
        try {
            // Store addresses
            $shippingAddress = Address::create(array_merge(
                $validated['shipping_address'],
                ['user_id' => $user?->id, 'session_id' => $user ? null : $sessionId, 'type' => 'shipping']
            ));

            $billingAddress = $shippingAddress; // Default to shipping address
            if (!empty($validated['billing_address'])) {
                $billingAddress = Address::create(array_merge(
                    $validated['billing_address'],
                    ['user_id' => $user?->id, 'session_id' => $user ? null : $sessionId, 'type' => 'billing']
                ));
            }

            // Create order
            $order = Order::create([
                'user_id' => $user?->id,
                'session_id' => $user ? null : $sessionId,
                'total' => $calculatedTotal,
                'status' => 'pending',
                'shipping_address_id' => $shippingAddress->id,
                'billing_address_id' => $billingAddress->id,
            ]);

            // Save order items & reduce stock
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            // Initialize Paystack payment
            $response = Http::withToken(env('PAYSTACK_SECRET_KEY'))
                ->post('https://api.paystack.co/transaction/initialize', [
                    'email' => $user?->email ?? $validated['shipping_address']['email'],
                    'amount' => $calculatedTotal * 100, // kobo
                    'reference' => 'order_' . $order->id,
                    'callback_url' => env('PAYSTACK_CALLBACK_URL', url('/api/payment/callback')),
                ]);

            $data = $response->json();

            if (!$response->successful() || !isset($data['data']['authorization_url'])) {
                DB::rollBack();
                return response()->json(['message' => 'Payment initialization failed'], 500);
            }

            // Clear cart
            $user
                ? CartItem::where('user_id', $user->id)->delete()
                : CartItem::where('session_id', $sessionId)->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load(['items.product', 'shippingAddress', 'billingAddress']),
                'authorization_url' => $data['data']['authorization_url'],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order creation failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        $sessionId = $request->input('sessionId', Session::getId());

        $orders = $user
            ? Order::where('user_id', $user->id)->with(['items.product', 'shippingAddress', 'billingAddress'])->get()
            : Order::where('session_id', $sessionId)->with(['items.product', 'shippingAddress', 'billingAddress'])->get();

        return response()->json(['orders' => $orders]);
    }
}