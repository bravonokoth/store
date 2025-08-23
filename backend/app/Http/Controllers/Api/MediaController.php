<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index()
    {
        return Media::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:jpg,png|max:2048',
            'type' => 'required|string',
            'mediable_id' => 'required|integer',
            'mediable_type' => 'required|string',
        ]);

        $path = $request->file('file')->store('media', 'public');
        return Media::create([
            'path' => $path,
            'type' => $validated['type'],
            'mediable_id' => $validated['mediable_id'],
            'mediable_type' => $validated['mediable_type'],
        ]);
    }

    public function destroy(Media $media)
    {
        Storage::disk('public')->delete($media->path);
        $media->delete();
        return response()->json(['message' => 'Media deleted']);
    }
}