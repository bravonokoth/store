<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($product_id)
    {
        return Review::where('product_id', $product_id)->with('user')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string',
        ]);
        $validated['user_id'] = $request->user()->id;
        return Review::create($validated);
    }


    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'rating' => 'integer|between:1,5',
            'comment' => 'nullable|string',
        ]);
        $review->update($validated);
        return $review;
    }

    public function destroy(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}