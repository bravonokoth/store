<?php

// app/Http/Controllers/UserController.php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'verified']);
        $this->middleware('role:superadmin')->only(['index', 'updateStatus', 'destroy', 'assignRole']);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'string|max:255',
            'email' => 'string|email|unique:users,email,' . $request->user()->id,
            'password' => 'string|min:8|confirmed|nullable',
        ]);

        $user = $request->user();
        $user->update($request->only('name', 'email') + ($request->password ? ['password' => Hash::make($request->password)] : []));
        return response()->json(['message' => 'Profile updated']);
    }

    public function destroy(Request $request)
    {
        if ($request->user()->hasRole('superadmin')) {
            return response()->json(['message' => 'Superadmin cannot delete their account'], 403);
        }
        $request->user()->delete();
        return response()->json(['message' => 'Account deleted']);
    }

    public function index()
    {
        return response()->json(User::with('roles')->get());
    }

    public function updateStatus(Request $request, User $user)
    {
        $request->validate(['status' => 'in:active,inactive']);
        $user->update(['status' => $request->status]);
        return response()->json(['message' => 'User status updated']);
    }

    public function destroyUser(User $user)
    {
        if ($user->hasRole('superadmin')) {
            return response()->json(['message' => 'Cannot delete superadmin'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function assignRole(Request $request, User $user)
    {
        $request->validate(['role' => 'required|string|in:client,admin,superadmin']);
        $user->syncRoles([$request->role]);
        return response()->json(['message' => 'Role assigned']);
    }
}