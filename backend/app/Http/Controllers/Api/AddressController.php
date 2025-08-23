<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->addresses;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'street' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'country' => 'required|string',
            'postal_code' => 'required|string',
            'is_default' => 'boolean',
        ]);
        $validated['user_id'] = $request->user()->id;

        if ($validated['is_default']) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        return Address::create($validated);
    }

    public function update(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'street' => 'string',
            'city' => 'string',
            'state' => 'string',
            'country' => 'string',
            'postal_code' => 'string',
            'is_default' => 'boolean',
        ]);

        if ($validated['is_default']) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address->update($validated);
        return $address;
    }

    public function destroy(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $address->delete();
        return response()->json(['message' => 'Address deleted']);
    }
}