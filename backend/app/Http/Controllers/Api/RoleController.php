<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return Role::with('permissions')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles',
            'permissions' => 'array|exists:permissions,id',
        ]);
        $role = Role::create(['name' => $validated['name']]);
        $role->permissions()->attach($validated['permissions']);
        return $role->load('permissions');
    }

    public function show(Role $role)
    {
        return $role->load('permissions');
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'string|unique:roles,name,' . $role->id,
            'permissions' => 'array|exists:permissions,id',
        ]);
        $role->update(['name' => $validated['name']]);
        $role->permissions()->sync($validated['permissions']);
        return $role->load('permissions');
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return response()->json(['message' => 'Role deleted']);
    }
}
