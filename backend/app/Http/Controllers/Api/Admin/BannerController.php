<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function store(Request $request)
    {
        $this->authorize('create', Banner::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image_path' => 'required|string',
            'link' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        $banner = Banner::create($validated);
        return response()->json(['message' => 'Banner created', 'banner' => $banner], 201);
    }
}