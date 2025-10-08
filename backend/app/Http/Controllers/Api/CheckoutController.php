<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Address;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;

class CheckoutController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = auth('sanctum')->user();
            $sessionId = $request->query('sessionId', Session::getId());

            Log::debug('Checkout API called', [
                'user_id' => $user?->id,
                'session_id' => $sessionId,
                'ip' => $request->ip(),
            ]);

            // Load cart items with product and media relationships
            $cartItems = $user
                ? CartItem::where('user_id', $user->id)->with(['product.media'])->get()
                : CartItem::where('session_id', $sessionId)->with(['product.media'])->get();

            if ($cartItems->isEmpty()) {
                Log::info('Cart is empty for checkout', [
                    'user_id' => $user?->id,
                    'session_id' => $sessionId,
                ]);
                return response()->json(['message' => 'Cart is empty'], 400);
            }

            // Calculate total and format cart items
            $total = 0;
            $formattedCartItems = $cartItems->map(function ($item) use (&$total) {
                if (!$item->product) {
                    Log::warning('Product not found for cart item', [
                        'cart_item_id' => $item->id,
                        'product_id' => $item->product_id,
                    ]);
                    return null;
                }
                if ($item->product->stock < $item->quantity) {
                    Log::warning('Insufficient stock for product', [
                        'product_id' => $item->product->id,
                        'product_name' => $item->product->name,
                        'stock' => $item->product->stock,
                        'quantity' => $item->quantity,
                    ]);
                    return null;
                }
                $total += $item->product->price * $item->quantity;

                // Get the first image from media
                $image = $item->product->media->where('type', 'image')->first();
                $imagePath = $image ? asset('storage/' . $image->path) : 'https://via.placeholder.com/150';

                return [
                    'id' => $item->id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => $item->product->price,
                        'image' => $imagePath,
                    ],
                    'quantity' => $item->quantity,
                ];
            })->filter()->values();

            if ($formattedCartItems->isEmpty()) {
                Log::warning('No valid cart items after processing', [
                    'user_id' => $user?->id,
                    'session_id' => $sessionId,
                ]);
                return response()->json(['message' => 'No valid cart items found'], 400);
            }

            // Load addresses
            $addresses = $user
                ? Address::where('user_id', $user->id)->get()
                : Address::where('session_id', $sessionId)->get();

            // Format addresses for frontend
            $formattedAddresses = $addresses->map(function ($address) {
                return [
                    'id' => $address->id,
                    'first_name' => $address->first_name ?? '',
                    'last_name' => $address->last_name ?? '',
                    'email' => $address->email ?? '',
                    'phone' => $address->phone_number ?? '',
                    'line1' => $address->line1 ?? '',
                    'line2' => $address->line2 ?? '',
                    'city' => $address->city ?? 'Nairobi',
                    'state' => $address->state ?? 'Nairobi',
                    'zip_code' => $address->postal_code ?? '',
                    'country' => $address->country ?? 'Kenya',
                    'type' => $address->type ?? 'shipping',
                ];
            });

            return response()->json([
                'cart_items' => $formattedCartItems,
                'total' => $total,
                'addresses' => $formattedAddresses,
            ], 200);
        } catch (QueryException $e) {
            Log::error('Database error in Checkout API', [
                'error' => $e->getMessage(),
                'user_id' => $user?->id,
                'session_id' => $sessionId,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Database error occurred',
                'error' => env('APP_DEBUG', false) ? $e->getMessage() : 'Internal server error',
            ], 500);
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