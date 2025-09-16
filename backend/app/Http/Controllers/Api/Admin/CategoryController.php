<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')->paginate(20);
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Category::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048', // Validate image (max 2MB)
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        $validated['slug'] = Str::slug($request->input('name') . '-' . time());
        $category = Category::create($validated);
        return response()->json(['message' => 'Category created', 'category' => $category], 201);
    }

    public function show(Category $category)
    {
        return response()->json($category->load('products'));
    }

    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('categories', 'public');
        }

        $validated['slug'] = Str::slug($request->input('name') . '-' . $category->id);
        $category->update($validated);
        return response()->json(['message' => 'Category updated', 'category' => $category]);
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }

    public function categories()
    {
        return response()->json(Category::select('id', 'name')->get());
    }

    public function search(Request $request)
    {
        $query = $request->input('search');
        $categories = Category::withCount('products')
            ->where('name', 'like', "%$query%")
            ->orWhere('description', 'like', "%$query%")
            ->get();
        return response()->json(['data' => $categories]);
    }
}