<?php

// app/Http/Controllers/ReviewController.php
namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'verified']);
        $this->middleware('role:admin|superadmin')->only(['index', 'approve', 'update', 'destroy', 'respond']);
    }

    public function index()
    {
        return response()->json(Review::with('user', 'product')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'string|nullable',
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'pending',
        ]);

        return response()->json($review, 201);
    }

    public function approve(Request $request, Review $review)
    {
        $request->validate(['status' => 'required|in:approved,rejected']);
        $review->update(['status' => $request->status]);
        return response()->json(['message' => 'Review status updated']);
    }

    public function update(Request $request, Review $review)
    {
        $request->validate([
            'rating' => 'integer|min:1|max:5',
            'comment' => 'string|nullable',
        ]);

        $review->update($request->only('rating', 'comment'));
        return response()->json(['message' => 'Review updated']);
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return response()->json(['message' => 'Review deleted']);
    }

    public function respond(Request $request, Review $review)
    {
        $request->validate(['admin_response' => 'required|string']);
        $review->update(['admin_response' => $request->admin_response]);
        return response()->json(['message' => 'Response added']);
    }
}