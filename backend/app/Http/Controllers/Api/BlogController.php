<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index()
    {
        return Blog::with('blogCategory', 'user')->get();
    }

    public function show(Blog $blog)
    {
        return $blog->load('blogCategory', 'user');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'blog_category_id' => 'required|exists:blog_categories,id',
        ]);
        $validated['user_id'] = $request->user()->id;
        return Blog::create($validated);
    }

    public function update(Request $request, Blog $blog)
    {
        $validated = $request->validate([
            'title' => 'string',
            'content' => 'string',
            'blog_category_id' => 'exists:blog_categories,id',
        ]);
        $blog->update($validated);
        return $blog;
    }

    public function destroy(Blog $blog)
    {
        $blog->delete();
        return response()->json(['message' => 'Blog deleted']);
    }
}