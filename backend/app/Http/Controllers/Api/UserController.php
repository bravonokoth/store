<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return User::with('roles')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'nullable|array|exists:roles,id', // Made nullable
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        if (!empty($validated['roles'])) {
            $user->roles()->attach($validated['roles']);
        }

        return $user->load('roles');
    }

    public function show(User $user)
    {
        return $user->load('roles');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'string',
            'email' => 'email|unique:users,email,' . $user->id,
            'roles' => 'nullable|array|exists:roles,id', // Made nullable
        ]);

        $user->update(array_filter($validated, fn($key) => $key !== 'roles', ARRAY_FILTER_USE_KEY));

        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return $user->load('roles');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}