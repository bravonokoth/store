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
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Http;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Order::class);

        $user = auth('sanctum')->user();
        $sessionId = Session::getId();

        // ✅ Load cart items
        $cartItems = $user
            ? CartItem::where('user_id', $user->id)->get()
            : CartItem::where('session_id', $sessionId)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // ✅ Validate address input
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.first_name' => 'required|string',
            'shipping_address.last_name' => 'required|string',
            'shipping_address.line1' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.country' => 'required|string',
            'billing_address' => 'nullable|array',
        ]);

        // ✅ Calculate order total
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
            // ✅ Store addresses
            $shippingAddress = Address::create(array_merge(
                $validated['shipping_address'],
                ['user_id' => $user?->id, 'session_id' => $user ? null : $sessionId, 'type' => 'shipping']
            ));

            $billingAddress = null;
            if (!empty($validated['billing_address'])) {
                $billingAddress = Address::create(array_merge(
                    $validated['billing_address'],
                    ['user_id' => $user?->id, 'session_id' => $user ? null : $sessionId, 'type' => 'billing']
                ));
            }

            // ✅ Create order
            $order = Order::create([
                'user_id' => $user?->id,
                'session_id' => $user ? null : $sessionId,
                'total' => $total,
                'status' => 'pending',
                'shipping_address_id' => $shippingAddress->id,
                'billing_address_id' => $billingAddress?->id,
            ]);

            // ✅ Save order items & reduce stock
            foreach ($cartItems as $item) {
                $product = Product::find($item->product_id);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $product->price,
                ]);

                $product->decrement('stock', $item->quantity);
            }

            // ✅ Initialize Paystack payment
$response = Http::withToken(env('PAYSTACK_SECRET_KEY'))
    ->post('https://api.paystack.co/transaction/initialize', [
        'email' => $user?->email ?? 'guest@example.com',
        'amount' => $total * 100, // kobo
        'reference' => 'order_' . $order->id,
        'callback_url' => url('/api/payment/callback'),
    ]);

$data = $response->json();

if (!isset($data['data']['authorization_url'])) {
    DB::rollBack();
    return response()->json([
        'message' => 'Payment initialization failed',
        'error' => $data
    ], 500);
}

            // ✅ Clear cart
            if ($user) {
                CartItem::where('user_id', $user->id)->delete();
            } else {
                CartItem::where('session_id', $sessionId)->delete();
            }

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load(['items.product', 'shippingAddress', 'billingAddress']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order creation failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        $sessionId = Session::getId();

        if ($user) {
            $orders = Order::where('user_id', $user->id)->with(['items.product', 'shippingAddress', 'billingAddress'])->get();
        } else {
            $orders = Order::where('session_id', $sessionId)->with(['items.product', 'shippingAddress', 'billingAddress'])->get();
        }

        return response()->json(['orders' => $orders]);
    }
}
