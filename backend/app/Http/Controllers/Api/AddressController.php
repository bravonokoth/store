<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class AddressController extends Controller
{
    public function index()
    {
        $user = auth('sanctum')->user();
        $sessionId = Session::getId();

        $addresses = $user
            ? Address::where('user_id', $user->id)->get()
            : Address::where('session_id', $sessionId)->get();

        return response()->json($addresses);
    }

    public function store(Request $request)
    {
        $user = auth('sanctum')->user();
        $sessionId = Session::getId();

        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'line1'      => 'required|string',
            'city'       => 'required|string',
            'country'    => 'required|string',
            'type'       => 'required|in:shipping,billing',
        ]);

        $address = Address::create(array_merge($validated, [
            'user_id'    => $user?->id,
            'session_id' => $user ? null : $sessionId,
        ]));

        return response()->json($address, 201);
    }

    public function update(Request $request, Address $address)
    {
        $this->authorize('update', $address);

        $validated = $request->validate([
            'first_name' => 'sometimes|string',
            'last_name'  => 'sometimes|string',
            'line1'      => 'sometimes|string',
            'city'       => 'sometimes|string',
            'country'    => 'sometimes|string',
            'type'       => 'sometimes|in:shipping,billing',
        ]);

        $address->update($validated);

        return response()->json($address);
    }

    public function destroy(Address $address)
    {
        $this->authorize('delete', $address);
        $address->delete();

        return response()->json(['message' => 'Address deleted']);
    }
}
