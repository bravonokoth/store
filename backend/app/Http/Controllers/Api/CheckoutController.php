<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Address;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = auth('sanctum')->user();
            // Use frontend-provided sessionId for guest users, fallback to Session::getId()
            $sessionId = $request->input('sessionId', Session::getId());

            // Log request details for debugging
            Log::debug('Checkout API called', [
                'user_id' => $user?->id,
                'session_id' => $sessionId,
                'ip' => $request->ip(),
            ]);

            // Load cart items with product relationship
            $cartItems = $user
                ? CartItem::where('user_id', $user->id)->with('product')->get()
                : CartItem::where('session_id', $sessionId)->with('product')->get();

            if ($cartItems->isEmpty()) {
                Log::info('Cart is empty for checkout', ['user_id' => $user?->id, 'session_id' => $sessionId]);
                return response()->json(['message' => 'Cart is empty'], 400);
            }

            // Calculate total with validation
            $total = 0;
            $formattedCartItems = $cartItems->map(function ($item) use (&$total) {
                // Check if product exists and has sufficient stock
                if (!$item->product) {
                    Log::warning('Product not found for cart item', ['cart_item_id' => $item->id]);
                    return null; // Skip invalid items
                }
                if ($item->product->stock < $item->quantity) {
                    Log::warning('Insufficient stock for product', [
                        'product_id' => $item->product->id,
                        'product_name' => $item->product->name,
                        'stock' => $item->product->stock,
                        'quantity' => $item->quantity,
                    ]);
                    return response()->json([
                        'message' => "Insufficient stock for product: {$item->product->name}",
                    ], 400);
                }
                $total += $item->product->price * $item->quantity;
                return [
                    'id' => $item->id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => $item->product->price,
                        'image' => $item->product->image ? asset('storage/' . $item->product->image) : 'https://via.placeholder.com/150',
                    ],
                    'quantity' => $item->quantity,
                ];
            })->filter()->values(); // Remove null items and reindex array

            if ($formattedCartItems->isEmpty()) {
                Log::warning('No valid cart items after processing');
                return response()->json(['message' => 'No valid cart items found'], 400);
            }

            // Load addresses
            $addresses = $user
                ? Address::where('user_id', $user->id)->get()
                : Address::where('session_id', $sessionId)->get();

            // Format addresses to match frontend expectations
            $formattedAddresses = $addresses->map(function ($address) {
                return [
                    'id' => $address->id,
                    'first_name' => $address->first_name ?? '',
                    'last_name' => $address->last_name ?? '',
                    'email' => $address->email ?? '',
                    'phone' => $address->phone ?? '',
                    'line1' => $address->line1 ?? $address->address ?? '',
                    'line2' => $address->line2 ?? $address->apartment ?? '',
                    'city' => $address->city ?? 'Nairobi',
                    'state' => $address->state ?? 'Nairobi',
                    'zip_code' => $address->zip_code ?? '',
                    'country' => $address->country ?? 'Kenya',
                    'type' => $address->type ?? 'shipping',
                ];
            });

            return response()->json([
                'cart_items' => $formattedCartItems,
                'total' => $total,
                'addresses' => $formattedAddresses,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Checkout API error', [
                'error' => $e->getMessage(),
                'user_id' => $user?->id,
                'session_id' => $sessionId,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to fetch checkout data',
                'error' => env('APP_DEBUG', false) ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}