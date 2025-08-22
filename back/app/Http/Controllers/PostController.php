<?php

// app/Http/Controllers/PostController.php
namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin|superadmin'])->only(['store', 'update', 'destroy']);
    }

    public function index(Request $request)
    {
        $posts = Post::with('category', 'user')
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->paginate(10);
        return response()->json($posts);
    }

    public function show(Post $post)
    {
        return response()->json($post->load('category', 'user', 'media'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
        ]);

        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'category_id' => $request->category_id,
            'user_id' => $request->user()->id,
        ]);

        if ($request->hasFile('media')) {
            $post->addMedia($request->file('media'))->toMediaCollection('posts');
        }

        return response()->json($post, 201);
    }

    public function update(Request $request, Post $post)
    {
        $request->validate([
            'title' => 'string|max:255',
            'content' => 'string',
            'category_id' => 'exists:categories,id',
        ]);

        $post->update($request->only('title', 'content', 'category_id'));
        if ($request->hasFile('media')) {
            $post->clearMediaCollection('posts');
            $post->addMedia($request->file('media'))->toMediaCollection('posts');
        }

        return response()->json($post);
    }

    public function destroy(Post $post)
    {
        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }
}