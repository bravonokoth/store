<?php

// app/Http/Controllers/OrderController.php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Notifications\NewOrder;
use App\Notifications\OrderShipped;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'verified']);
        $this->middleware('role:admin|superadmin')->only(['index', 'updateStatus', 'cancel', 'updateTracking', 'updateShippingStatus', 'generateInvoice']);
    }

    public function index()
    {
        return response()->json(Order::with('items.product', 'user')->get());
    }

    public function userOrders(Request $request)
    {
        return response()->json($request->user()->orders()->with('items.product')->get());
    }

    public function show(Order $order)
    {
        $this->authorize('view', $order);
        return response()->json($order->load('items.product', 'user'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|array',
            'payment_method' => 'required|in:card,cod',
            'coupon_code' => 'nullable|string',
        ]);

        $subtotal = 0;
        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $subtotal += $product->price * $item['quantity'];
        }

        $coupon = $request->coupon_code ? Coupon::where('code', $request->coupon_code)->firstOrFail() : null;
        $discount = $coupon && !$coupon->isExpired() ? $coupon->discount : 0;
        $shipping_cost = $this->calculateShipping($request->shipping_address);
        $total = $subtotal - $discount + $shipping_cost;

        $order = Order::create([
            'user_id' => $request->user()->id,
            'subtotal' => $subtotal,
            'shipping_cost' => $shipping_cost,
            'total' => $total,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
            'shipping_address' => $request->shipping_address,
            'coupon_id' => $coupon ? $coupon->id : null,
        ]);

        foreach ($request->items as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => Product::find($item['product_id'])->price,
            ]);
        }

        User::role('admin')->each->notify(new NewOrder($order));

        return response()->json($order, 201);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate(['status' => 'required|in:pending,processing,shipped,delivered,cancelled']);
        $order->update(['status' => $request->status]);
        return response()->json(['message' => 'Order status updated']);
    }

    public function cancel(Order $order)
    {
        $order->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Order cancelled']);
    }

    public function updateTracking(Request $request, Order $order)
    {
        $request->validate(['tracking_id' => 'required|string']);
        $order->update(['tracking_id' => $request->tracking_id]);
        return response()->json(['message' => 'Tracking ID updated']);
    }

    public function updateShippingStatus(Request $request, Order $order)
    {
        $request->validate(['shipping_status' => 'required|in:processing,shipped,delivered']);
        $order->update(['shipping_status' => $request->shipping_status]);
        if ($request->shipping_status === 'delivered') {
            $order->user->notify(new OrderShipped($order));
        }
        return response()->json(['message' => 'Shipping status updated']);
    }

    public function generateInvoice(Order $order)
    {
        $pdf = Pdf::loadView('invoices.order', ['order' => $order->load('items.product', 'user')]);
        return $pdf->download('invoice-' . $order->id . '.pdf');
    }

    protected function calculateShipping($address)
    {
        $zone = ShippingZone::whereJsonContains('locations', $address['region'])->first();
        return $zone ? $zone->rate : 10.00;
    }
}