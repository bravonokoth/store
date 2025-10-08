<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;

class CartController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
                'sessionId' => 'nullable|string',
            ]);

            $user = auth('sanctum')->user();
            $sessionId = $request->input('sessionId', Session::getId());

            Log::debug('Cart store called', [
                'user_id' => $user?->id,
                'session_id' => $sessionId,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
            ]);

            $product = Product::find($validated['product_id']);
            if (!$product || $product->stock < $validated['quantity']) {
                Log::warning('Insufficient stock or product not found', [
                    'product_id' => $validated['product_id'],
                    'stock' => $product ? $product->stock : null,
                    'quantity' => $validated['quantity'],
                ]);
                return response()->json(['message' => "Insufficient stock for product: {$product->name}"], 400);
            }

            $cartItem = CartItem::updateOrCreate(
                [
                    'user_id' => $user ? $user->id : null,
                    'session_id' => $user ? null : $sessionId,
                    'product_id' => $validated['product_id'],
                ],
                ['quantity' => $validated['quantity']]
            );

            return response()->json([
                'message' => 'Cart item added',
                'cart_item' => $cartItem->load(['product.media']),
            ], 201);
        } catch (QueryException $e) {
            Log::error('Database error in Cart store', [
                'error' => $e->getMessage(),
                'user_id' => $user?->id,
                'session_id' => $sessionId,
                'product_id' => $validated['product_id'] ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to add item to cart'], 500);
        } catch (\Exception $e) {
            Log::error('Cart store error', [
                'error' => $e->getMessage(),
                'user_id' => $user?->id,
                'session_id' => $sessionId,
                'product_id' => $validated['product_id'] ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to add item to cart'], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            $user = auth('sanctum')->user();
            $sessionId = $request->input('sessionId', Session::getId());

            Log::debug('Cart index called', [
                'user_id' => $user?->id,
                'session_id' => $sessionId,
            ]);

            $cartItems = $user
                ? CartItem::where('user_id', $user->id)->with(['product.media'])->get()
                : CartItem::where('session_id', $sessionId)->with(['product.media'])->get();

            $formattedCartItems = $cartItems->map(function ($item) {
                if (!$item->product) {
                    Log::warning('Product not found for cart item', [
                        'cart_item_id' => $item->id,
                        'product_id' => $item->product_id,
                    ]);
                    return null;
                }
                $image = $item->product->media->where('type', 'image')->first();
                return [
                    'id' => $item->id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => $item->product->price,
                        'image' => $image ? asset('storage/' . $image->path) : 'https://via.placeholder.com/150',
                    ],
                    'quantity' => $item->quantity,
                ];
            })->filter()->values();

            $total = $formattedCartItems->sum(function ($item) {
                return $item['product']['price'] * $item['quantity'];
            });

            return response()->json([
                'cart_items' => $formattedCartItems,
                'total' => $total,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Cart index error', [
                'error' => $e->getMessage(),
                'user_id' => $user?->id,
                'session_id' => $sessionId,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to fetch cart'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1',
            ]);

            $cartItem = CartItem::findOrFail($id);
            if ($cartItem->product->stock < $validated['quantity']) {
                return response()->json(['message' => "Insufficient stock for product: {$cartItem->product->name}"], 400);
            }

            $cartItem->update(['quantity' => $validated['quantity']]);

            return response()->json([
                'message' => 'Cart item updated',
                'cart_item' => $cartItem->load(['product.media']),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Cart update error', [
                'error' => $e->getMessage(),
                'cart_item_id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to update cart item'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $cartItem = CartItem::findOrFail($id);
            $cartItem->delete();

            return response()->json(['message' => 'Cart item removed'], 200);
        } catch (\Exception $e) {
            Log::error('Cart destroy error', [
                'error' => $e->getMessage(),
                'cart_item_id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to remove cart item'], 500);
        }
    }
}