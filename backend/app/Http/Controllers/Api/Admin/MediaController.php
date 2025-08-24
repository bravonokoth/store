<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Media::class);

        $validated = $request->validate([
            'model_type' => 'required|in:App\Models\Product,App\Models\Category',
            'model_id' => 'required|integer',
            'path' => 'required|string',
            'type' => 'required|in:image,video',
        ]);

        $media = Media::create($validated);
        return response()->json(['message' => 'Media created', 'media' => $media], 201);
    }
}