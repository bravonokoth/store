<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;

class BlogCategoryController extends Controller
{
    public function index()
    {
        return BlogCategory::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string']);
        return BlogCategory::create($validated);
    }

    public function show(BlogCategory $blogCategory)
    {
        return $blogCategory;
    }

    public function update(Request $request, BlogCategory $blogCategory)
    {
        $validated = $request->validate(['name' => 'string']);
        $blogCategory->update($validated);
        return $blogCategory;
    }

    public function destroy(BlogCategory $blogCategory)
    {
        $blogCategory->delete();
        return response()->json(['message' => 'Blog category deleted']);
    }
}