<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function initialize(Request $request)
    {
        $response = Http::withToken(env('PAYSTACK_SECRET_KEY'))
            ->post('https://api.paystack.co/transaction/initialize', [
                'email' => $request->email,
                'amount' => $request->amount * 100, // Paystack expects amount in kobo (NGN) or cents
                'callback_url' => url('/api/payment/callback')
            ]);

        return response()->json($response->json());
    }

 public function callback(Request $request)
{
    $reference = $request->reference;

    $response = Http::withToken(env('PAYSTACK_SECRET_KEY'))
        ->get("https://api.paystack.co/transaction/verify/{$reference}");

    $data = $response->json();

    if ($data['data']['status'] === 'success') {
        // ✅ Extract order ID from reference
        $orderId = str_replace('order_', '', $data['data']['reference']);
        $order = Order::find($orderId);

        if ($order) {
            $order->update(['status' => 'paid']);
        }

        return response()->json(['message' => 'Payment successful', 'order' => $order]);
    }

    return response()->json(['message' => 'Payment failed', 'data' => $data], 400);
}

}
