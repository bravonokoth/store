<?php

// app/Http/Controllers/BannerController.php
namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin|superadmin'])->except(['index']);
    }

    public function index()
    {
        return response()->json(Banner::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|max:2048',
            'link' => 'nullable|url',
        ]);

        $banner = Banner::create($request->only('title', 'link'));
        $banner->addMedia($request->file('image'))->toMediaCollection('banners');
        return response()->json($banner, 201);
    }

    public function update(Request $request, Banner $banner)
    {
        $request->validate([
            'title' => 'string|max:255',
            'image' => 'image|max:2048',
            'link' => 'nullable|url',
        ]);

        $banner->update($request->only('title', 'link'));
        if ($request->hasFile('image')) {
            $banner->clearMediaCollection('banners');
            $banner->addMedia($request->file('image'))->toMediaCollection('banners');
        }

        return response()->json($banner);
    }

    public function destroy(Banner $banner)
    {
        $banner->delete();
        return response()->json(['message' => 'Banner deleted']);
    }
}