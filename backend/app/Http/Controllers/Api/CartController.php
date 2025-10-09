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
                'user_id' => $user ? $user->id : null,
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
                return response()->json(['message' => 'Insufficient stock for product: ' . ($product ? $product->name : 'Unknown')], 400);
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
                'cart_item' => [
                    'id' => $cartItem->id,
                    'product_id' => $cartItem->product_id,
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => (float) $product->price,
                        'stock' => (int) $product->stock,
                        'image' => $product->media->where('type', 'image')->first()
                            ? asset('storage/' . $product->media->where('type', 'image')->first()->path)
                            : 'https://via.placeholder.com/150',
                    ],
                    'quantity' => $cartItem->quantity,
                ],
                'total' => (float) ($product->price * $cartItem->quantity),
            ], 201);
        } catch (QueryException $e) {
            Log::error('Database error in Cart store', [
                'error' => $e->getMessage(),
                'user_id' => $user ? $user->id : null,
                'session_id' => $sessionId,
                'product_id' => $validated['product_id'] ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to add item to cart'], 500);
        } catch (\Exception $e) {
            Log::error('Cart store error', [
                'error' => $e->getMessage(),
                'user_id' => $user ? $user->id : null,
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
            $sessionId = $request->query('sessionId', Session::getId());

            Log::debug('Cart index called', [
                'user_id' => $user ? $user->id : null,
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
                    $item->delete();
                    return null;
                }
                $image = $item->product->media->where('type', 'image')->first();
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => (float) $item->product->price,
                        'stock' => (int) $item->product->stock,
                        'image' => $image ? asset('storage/' . $image->path) : 'https://via.placeholder.com/150',
                    ],
                    'quantity' => $item->quantity,
                ];
            })->filter()->values();

            $total = $formattedCartItems->sum(function ($item) {
                return $item['product']['price'] * $item['quantity'];
            });

            if ($formattedCartItems->isEmpty()) {
                return response()->json([
                    'message' => 'Cart is empty',
                    'cart_items' => [],
                    'total' => 0.0,
                ], 200);
            }

            return response()->json([
                'cart_items' => $formattedCartItems,
                'total' => (float) $total,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Cart index error', [
                'error' => $e->getMessage(),
                'user_id' => $user ? $user->id : null,
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
                'sessionId' => 'nullable|string',
            ]);

            $user = auth('sanctum')->user();
            $sessionId = $request->input('sessionId', Session::getId());

            $cartItem = CartItem::where('id', $id)
                ->where($user ? 'user_id' : 'session_id', $user ? $user->id : $sessionId)
                ->firstOrFail();

            if (!$cartItem->product) {
                Log::warning('Product not found for cart item', [
                    'cart_item_id' => $cartItem->id,
                    'product_id' => $cartItem->product_id,
                ]);
                $cartItem->delete();
                return response()->json(['message' => 'Cart item removed due to missing product'], 400);
            }

            if ($cartItem->product->stock < $validated['quantity']) {
                return response()->json(['message' => 'Insufficient stock for product: ' . $cartItem->product->name], 400);
            }

            $cartItem->update(['quantity' => $validated['quantity']]);

            return response()->json([
                'message' => 'Cart item updated',
                'cart_item' => [
                    'id' => $cartItem->id,
                    'product_id' => $cartItem->product_id,
                    'product' => [
                        'id' => $cartItem->product->id,
                        'name' => $cartItem->product->name,
                        'price' => (float) $cartItem->product->price,
                        'stock' => (int) $cartItem->product->stock,
                        'image' => $cartItem->product->media->where('type', 'image')->first()
                            ? asset('storage/' . $cartItem->product->media->where('type', 'image')->first()->path)
                            : 'https://via.placeholder.com/150',
                    ],
                    'quantity' => $cartItem->quantity,
                ],
                'total' => (float) ($cartItem->product->price * $cartItem->quantity),
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

    public function destroy(Request $request, $id)
    {
        try {
            $user = auth('sanctum')->user();
            $sessionId = $request->query('sessionId', Session::getId());

            $cartItem = CartItem::where('id', $id)
                ->where($user ? 'user_id' : 'session_id', $user ? $user->id : $sessionId)
                ->firstOrFail();
            $cartItem->delete();

            $cartItems = $user
                ? CartItem::where('user_id', $user->id)->with(['product.media'])->get()
                : CartItem::where('session_id', $sessionId)->with(['product.media'])->get();

            $formattedCartItems = $cartItems->map(function ($item) {
                if (!$item->product) {
                    Log::warning('Product not found for cart item', [
                        'cart_item_id' => $item->id,
                        'product_id' => $item->product_id,
                    ]);
                    $item->delete();
                    return null;
                }
                $image = $item->product->media->where('type', 'image')->first();
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'price' => (float) $item->product->price,
                        'stock' => (int) $item->product->stock,
                        'image' => $image ? asset('storage/' . $image->path) : 'https://via.placeholder.com/150',
                    ],
                    'quantity' => $item->quantity,
                ];
            })->filter()->values();

            $total = $formattedCartItems->sum(function ($item) {
                return $item['product']['price'] * $item['quantity'];
            });

            return response()->json([
                'message' => 'Cart item removed',
                'cart_items' => $formattedCartItems,
                'total' => (float) $total,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Cart destroy error', [
                'error' => $e->getMessage(),
                'cart_item_id' => $id,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to remove cart item'], 500);
        }
    }

    public function clear(Request $request)
    {
        try {
            $user = auth('sanctum')->user();
            $sessionId = $request->query('sessionId', Session::getId());

            CartItem::where($user ? 'user_id' : 'session_id', $user ? $user->id : $sessionId)->delete();

            return response()->json([
                'message' => 'Cart cleared',
                'cart_items' => [],
                'total' => 0.0,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Cart clear error', [
                'error' => $e->getMessage(),
                'user_id' => $user ? $user->id : null,
                'session_id' => $sessionId,
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to clear cart'], 500);
        }
    }
}