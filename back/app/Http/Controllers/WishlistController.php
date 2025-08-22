<?php

// app/Http/Controllers/WishlistController.php
namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'verified']);
    }

    public function index(Request $request)
    {
        return response()->json($request->user()->wishlist()->with('product')->get());
    }

    public function add(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);
        $wishlist = Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ]);
        return response()->json($wishlist, 201);
    }

    public function remove(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);
        Wishlist::where([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
        ])->delete();
        return response()->json(['message' => 'Removed from wishlist']);
    }
}