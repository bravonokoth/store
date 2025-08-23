<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::all();
    }

    public function show($id)
    {
        return Category::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string']);
        return Category::create($validated);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate(['name' => 'string']);
        $category->update($validated);
        return $category;
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}