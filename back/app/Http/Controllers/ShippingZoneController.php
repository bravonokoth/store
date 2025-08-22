<?php

// app/Http/Controllers/ShippingZoneController.php
namespace App\Http\Controllers;

use App\Models\ShippingZone;
use Illuminate\Http\Request;

class ShippingZoneController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin|superadmin'])->except(['index']);
    }

    public function index()
    {
        return response()->json(ShippingZone::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'locations' => 'required|array',
            'rate' => 'required|numeric|min:0',
        ]);

        $zone = ShippingZone::create($request->all());
        return response()->json($zone, 201);
    }

    public function update(Request $request, ShippingZone $zone)
    {
        $request->validate([
            'name' => 'string|max:255',
            'locations' => 'array',
            'rate' => 'numeric|min:0',
        ]);

        $zone->update($request->all());
        return response()->json($zone);
    }

    public function destroy(ShippingZone $zone)
    {
        $zone->delete();
        return response()->json(['message' => 'Shipping zone deleted']);
    }
}